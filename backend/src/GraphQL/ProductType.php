<?php
namespace Break\Backend\GraphQL;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use PDO;

class GalleryImageType extends ObjectType {
    public function __construct() {
        parent::__construct([
            'name' => 'GalleryImage',
            'fields' => [
                'id' => Type::int(),
                'product_id' => Type::string(),
                'image_url' => Type::string(),
            ],
        ]);
    }
}

class PriceType extends ObjectType {
    public function __construct() {
        parent::__construct([
            'name' => 'Price',
            'fields' => [
                'id' => Type::int(),
                'product_id' => Type::string(),
                'amount' => Type::float(), 
                'currency_label' => Type::string(),
                'currency_symbol' => Type::string(),
            ],
        ]);
    }
}

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
                    'type' => Type::listOf(new GalleryImageType()), 
                ],
                'price' => [
                    'type' => Type::listOf(new PriceType()), 
                ],
            ],
            'resolveField' => function($product, $args, $context, $info) {
                if ($info->fieldName === 'gallery') {
                    $stmt = $context['pdo']->prepare("SELECT * FROM product_gallery WHERE product_id = ?");
                    $stmt->execute([$product['id']]);
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                if ($info->fieldName === 'price') {
                    $stmt = $context['pdo']->prepare("SELECT * FROM prices WHERE product_id = ?");
                    $stmt->execute([$product['id']]);
                    return $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                return $product[$info->fieldName] ?? null;
            }
        ]);
    }
}
