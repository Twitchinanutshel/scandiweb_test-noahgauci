<?php

namespace Break\Backend\Controller;

use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use GraphQL\Type\Definition\InputObjectType;
use Break\Backend\GraphQL\ProductType;
use RuntimeException;
use Throwable;
use Dotenv\Dotenv;
use PDO;

class GraphQL {

    public static function handle() {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Origin: *");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('HTTP/1.1 200 OK');
            exit;
        }

        try {
            $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
            $dotenv->load();

            $servername = $_ENV['DB_HOST'];
            $username = $_ENV['DB_USER'];
            $password = $_ENV['DB_PASS'];
            $dbname = $_ENV['DB_NAME'];

            $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $productType = new ProductType();
            $productController = new ProductController($pdo);

            $queryType = new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'products' => [
                        'type' => Type::listOf($productType),
                        'args' => [
                            'category' => Type::string(),
                        ],
                        'resolve' => function($root, $args, $context) use ($productController) {
                            return isset($args['category']) 
                                ? $productController->getProductsByCategory($args['category']) 
                                : $productController->getAllProducts();
                        },
                    ],
                    'product' => [
                        'type' => $productType,
                        'args' => [
                            'id' => Type::nonNull(Type::id())
                        ],
                        'resolve' => function($root, $args, $context) use ($productController) {
                            return $productController->getProductById($args['id']);
                        }
                    ]
                ],
            ]);

            $mutationType = new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'sum' => [
                        'type' => Type::int(),
                        'args' => [
                            'x' => ['type' => Type::int()],
                            'y' => ['type' => Type::int()],
                        ],
                        'resolve' => static fn ($calc, array $args): int => $args['x'] + $args['y'],
                    ],
                    'placeOrder' => [
                        'type' => new ObjectType([
                            'name' => 'OrderResult',
                            'fields' => [
                                'id' => Type::id(),
                                'success' => Type::boolean(),
                                'message' => Type::string(),
                                'total' => Type::float(),
                                'currency' => Type::string(),
                            ]
                        ]),
                        'args' => [
                            'input' => Type::nonNull(Type::listOf(Type::nonNull(new InputObjectType([
                                'name' => 'OrderItemInput',
                                'fields' => [
                                    'productId' => Type::nonNull(Type::string()),
                                    'quantity' => Type::nonNull(Type::int()),
                                    'attributes' => Type::nonNull(Type::listOf(
                                        new InputObjectType([
                                            'name' => 'AttributeInput',
                                            'fields' => [
                                                'name' => Type::nonNull(Type::string()),
                                                'value' => Type::nonNull(Type::string()),
                                            ],
                                        ])
                                    )),
                                ],
                            ]))))
                        ],
                        'resolve' => function ($root, $args, $context) {
                            $pdo = $context['pdo'];
                            $input = $args['input'];

                            try {
                                $pdo->beginTransaction();

                                $total = 0;
                                $currencySymbol = null;

                                foreach ($input as $item) {
                                    if (!isset($item['productId'], $item['quantity'], $item['attributes'])) {
                                        throw new \Exception("Invalid order item format.");
                                    }

                                    $priceStmt = $pdo->prepare("SELECT amount, currency_symbol FROM prices WHERE product_id = ? LIMIT 1");
                                    $priceStmt->execute([$item['productId']]);
                                    $priceRow = $priceStmt->fetch(PDO::FETCH_ASSOC);

                                    if (!$priceRow) {
                                        throw new \Exception("Price not found for product: " . $item['productId']);
                                    }

                                    $total += $priceRow['amount'] * $item['quantity'];
                                    if (!$currencySymbol) {
                                        $currencySymbol = $priceRow['currency_symbol'];
                                    }
                                }

                                $orderStmt = $pdo->prepare("INSERT INTO orders (created_at, total, currency_symbol) VALUES (NOW(), ?, ?)");
                                $orderStmt->execute([$total, $currencySymbol]);
                                $orderId = $pdo->lastInsertId();

                                foreach ($input as $item) {
                                    $stmt = $pdo->prepare("SELECT name FROM products WHERE id = ?");
                                    $stmt->execute([$item['productId']]);
                                    $product = $stmt->fetch(PDO::FETCH_ASSOC);
                                    if (!$product) {
                                        throw new \Exception("Product not found: " . $item['productId']);
                                    }

                                    $stmt = $pdo->prepare("SELECT amount, currency_symbol FROM prices WHERE product_id = ? LIMIT 1");
                                    $stmt->execute([$item['productId']]);
                                    $priceRow = $stmt->fetch(PDO::FETCH_ASSOC);

                                    if (!$priceRow) {

                                        throw new \Exception("Price not found for product: " . $item['productId']);
                                    }

                                    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
                                    $stmt->execute([

                                        $orderId,

                                        $item['productId'],

                                        $product['name'],

                                        $item['quantity'],

                                        $priceRow['amount']
                                    ]);

                                }

                                $pdo->commit();
                                return [
                                    'id' => $orderId,
                                    'success' => true,
                                    'message' => 'Order placed successfully',
                                    'total' => $total,
                                    'currency' => $currencySymbol
                                ];

                            } catch (Throwable $e) {
                                $pdo->rollBack();
                                return [
                                    'id' => null,
                                    'success' => false,
                                    'message' => 'Error: ' . $e->getMessage(),
                                    'total' => 0,
                                    'currency' => null
                                ];
                            }
                        },
                    ]
                ],
            ]);

            $schema = new Schema(
                (new SchemaConfig())
                    ->setQuery($queryType)
                    ->setMutation($mutationType)
            );

            $context = ['pdo' => $pdo];

            $rawInput = file_get_contents('php://input');
            if ($rawInput === false) {
                throw new RuntimeException('Failed to get php://input');
            }

            $input = json_decode($rawInput, true);
            $query = $input['query'];
            $variableValues = $input['variables'] ?? null;

            $rootValue = ['prefix' => 'You said: '];
            $result = GraphQLBase::executeQuery($schema, $query, $rootValue, $context, $variableValues);
            $output = $result->toArray();

        } catch (Throwable $e) {
            error_log('GraphQL Error: ' . $e->getMessage());
            $output = [
                'error' => [
                    'message' => $e->getMessage(),
                    'trace'   => $e->getTraceAsString(),
                ],
            ];
        }

        header('Content-Type: application/json; charset=UTF-8');
        return json_encode($output);
    }
}
