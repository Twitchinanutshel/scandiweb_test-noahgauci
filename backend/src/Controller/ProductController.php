<?php

namespace Break\Backend\Controller;

use PDO;
use Break\Backend\GraphQL\ProductType;
use GraphQL\Type\Definition\Type;

class ProductController {

    protected $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getAllProducts() {
        $stmt = $this->pdo->query("SELECT id, name, inStock, description, category, brand FROM products");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Modify data as needed before returning
        foreach ($products as &$product) {
            $product['inStock'] = (bool) $product['inStock'];
            $product['__typename'] = "Product";
        }

        return $products;
    }
}
