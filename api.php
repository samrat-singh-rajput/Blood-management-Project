
<?php
/**
 * Blood Bank API - Professional XAMPP Backend
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

class Database {
    private $host = 'localhost';
    private $user = 'root';
    private $pass = '';
    private $db   = 'bloodbank_system';
    public $conn;

    public function __construct() {
        $this->conn = @new mysqli($this->host, $this->user, $this->pass, $this->db);
        if ($this->conn->connect_error) {
            echo json_encode(["error" => "DB Connection Failed"]);
            exit();
        }
    }

    public function query($sql, $params = [], $types = "") {
        $stmt = $this->conn->prepare($sql);
        if ($params) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function execute($sql, $params = [], $types = "") {
        $stmt = $this->conn->prepare($sql);
        if ($params) $stmt->bind_param($types, ...$params);
        return $stmt->execute();
    }
}

class BloodBankAPI {
    private $db;
    private $input;

    public function __construct() {
        $this->db = new Database();
        $this->input = json_decode(file_get_contents('php://input'), true);
    }

    public function handleRequest($action) {
        switch ($action) {
            case 'login': $this->login(); break;
            case 'check_email': $this->checkEmail(); break;
            case 'complete_signup': $this->completeSignup(); break;
            case 'get_users': $this->getUsers(); break;
            case 'get_requests': $this->getRequests(); break;
            case 'get_hospitals': $this->getHospitals(); break;
            case 'get_feedbacks': $this->getFeedbacks(); break;
            case 'add_hospital': $this->addHospital(); break;
            case 'add_request': $this->addRequest(); break;
            case 'add_feedback': $this->addFeedback(); break;
            default: echo json_encode(["error" => "Invalid Action"]);
        }
    }

    private function login() {
        $u = $this->input['username'] ?? '';
        $p = $this->input['password'] ?? '';
        $r = $this->input['role'] ?? '';
        
        $res = $this->db->query("SELECT * FROM users WHERE (username=? OR email=?) AND role=?", [$u, $u, $r], "sss");
        $user = $res->fetch_assoc();
        
        if ($user && password_verify($p, $user['password'])) {
            $user['_id'] = $user['id'];
            unset($user['password']);
            echo json_encode(["user" => $user]);
        } else {
            echo json_encode(["error" => "Invalid credentials or role mismatch"]);
        }
    }

    private function checkEmail() {
        $email = strtolower($this->input['email'] ?? '');
        $res = $this->db->query("SELECT id FROM users WHERE email=?", [$email], "s");
        if ($res->num_rows > 0) {
            echo json_encode(["error" => "Email already registered. Please log in."]);
        } else {
            echo json_encode(["success" => true, "message" => "Email available"]);
        }
    }

    private function completeSignup() {
        $email = strtolower($this->input['email'] ?? '');
        $user = $this->input['username'] ?? '';
        $pass = password_hash($this->input['password'] ?? '', PASSWORD_DEFAULT);
        $role = $this->input['role'] ?? 'USER';
        $name = $this->input['name'] ?? $user;
        $id = uniqid('BB_');
        $jd = date('Y-m-d');

        // Final check for duplicates
        $check = $this->db->query("SELECT id FROM users WHERE username=? OR email=?", [$user, $email], "ss");
        if ($check->num_rows > 0) {
            echo json_encode(["error" => "Identity Conflict: Username or Email taken."]); return;
        }

        $sql = "INSERT INTO users (id, username, password, role, name, email, joinDate, status) VALUES (?,?,?,?,?,?,?,'Active')";
        if ($this->db->execute($sql, [$id, $user, $pass, $role, $name, $email, $jd], "sssssss")) {
            $res = $this->db->query("SELECT * FROM users WHERE id=?", [$id], "s");
            $userData = $res->fetch_assoc();
            $userData['_id'] = $userData['id'];
            unset($userData['password']);
            echo json_encode(["user" => $userData]);
        } else {
            echo json_encode(["error" => "MySQL Storage Error."]);
        }
    }

    private function getUsers() {
        $res = $this->db->conn->query("SELECT * FROM users");
        $data = []; while($row = $res->fetch_assoc()) { $row['_id'] = $row['id']; unset($row['password']); $data[] = $row; }
        echo json_encode($data);
    }

    private function getRequests() {
        $res = $this->db->conn->query("SELECT * FROM requests ORDER BY createdAt DESC");
        $data = []; while($row = $res->fetch_assoc()) { $row['_id'] = (string)$row['id']; $data[] = $row; }
        echo json_encode($data);
    }

    private function getHospitals() {
        $res = $this->db->conn->query("SELECT * FROM hospitals");
        $data = []; while($row = $res->fetch_assoc()) { $row['_id'] = (string)$row['id']; $data[] = $row; }
        echo json_encode($data);
    }

    private function getFeedbacks() {
        $res = $this->db->conn->query("SELECT * FROM feedback");
        $data = []; while($row = $res->fetch_assoc()) { $row['_id'] = (string)$row['id']; $data[] = $row; }
        echo json_encode($data);
    }

    private function addHospital() {
        $n = $this->input['name']; $c = $this->input['city']; $a = $this->input['address']; $p = $this->input['phone']; $e = $this->input['email'];
        $this->db->execute("INSERT INTO hospitals (name, city, address, phone, email) VALUES (?,?,?,?,?)", [$n, $c, $a, $p, $e], "sssss");
        echo json_encode(["success" => true]);
    }

    private function addRequest() {
        $dn = $this->input['donorName']; $bt = $this->input['bloodType']; $u = $this->input['urgency']; $h = $this->input['hospital']; $l = $this->input['location']; $p = $this->input['phone']; $t = $this->input['type'] ?? 'Request'; $d = date('Y-m-d');
        $this->db->execute("INSERT INTO requests (donorName, bloodType, urgency, hospital, location, phone, type, date) VALUES (?,?,?,?,?,?,?,?)", [$dn, $bt, $u, $h, $l, $p, $t, $d], "ssssssss");
        echo json_encode(["success" => true]);
    }

    private function addFeedback() {
        $uid = $this->input['userId']; $role = $this->input['userRole']; $msg = $this->input['message']; $date = date('Y-m-d H:i:s');
        $this->db->execute("INSERT INTO feedback (userId, userRole, message, date) VALUES (?,?,?,?)", [$uid, $role, $msg, $date], "ssss");
        echo json_encode(["success" => true]);
    }
}

$api = new BloodBankAPI();
$api->handleRequest($_GET['action'] ?? '');
?>
