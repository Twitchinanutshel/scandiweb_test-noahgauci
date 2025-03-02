<?php

namespace Break\Backend\GraphQL;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use PDO;

class ProductType extends ObjectType {
    public function __construct() {
        parent::__construct([
            'name' => 'Product',
            'fields' => [
                'id' => Type::string(),
                'name' => Type::string(),
                'inStock' => Type::boolean(),
                'description' => Type::string(),
                'category' => Type::string(),
                'brand' => Type::string(),
                '__typename' => Type::string(),
                'gallery' => [
                    'type' => Type::listOf(
                        new ObjectType([
                            'name' => 'GalleryImage',
                            'fields' => [
                                'id' => Type::int(),
                                'product_id' => Type::string(),
                                'image_url' => Type::string()
                            ]
                        ])
                    )
                ]
            ],
            'resolveField' => function($product, $args, $context, $info) {
                if ($info->fieldName === 'gallery') {
                    $stmt = $context['pdo']->prepare("SELECT * FROM product_gallery WHERE product_id = ?");
                    $stmt->execute([$product['id']]);
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                return $product[$info->fieldName] ?? null;
            }
        ]);
    }
}
