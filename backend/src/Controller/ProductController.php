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
        $stmt = $this->pdo->query("SELECT * FROM products");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getProductsByCategory($category) {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE category = :category");
        $stmt->bindParam(':category', $category, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
