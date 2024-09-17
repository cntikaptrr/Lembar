<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "surat";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

$sql = "SELECT 
            layanan.id AS layanan_id, 
            layanan.nama AS layanan_nama, 
            layanan.deskripsi AS layanan_format,
            layanan.janji AS layanan_janji,  
            layanan.hardcopy AS layanan_hardcopy,  
            GROUP_CONCAT(ceklist.uraian SEPARATOR '|||') AS ceklist_uraian,  
            teams.nama AS teams_nama
        FROM layanan
        LEFT JOIN ceklist ON layanan.id = ceklist.layanan
        LEFT JOIN teams ON layanan.teams = teams.id
        GROUP BY layanan.id, teams.nama;";

$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(['error' => 'Query failed: ' . $conn->error]);
    exit();
}

$services = [];
while($row = $result->fetch_assoc()) {
    $services[] = [
        'layanan_id' => $row['layanan_id'],
        'layanan_nama' => $row['layanan_nama'],
        'layanan_format' => $row['layanan_format'],
        'layanan_janji' => $row['layanan_janji'],
        'layanan_hardcopy' => $row['layanan_hardcopy'],
        'ceklist_uraian' => $row['ceklist_uraian'] ? explode('|||', $row['ceklist_uraian']) : [], 
        'teams_nama' => $row['teams_nama']
    ];
}

$conn->close();

echo json_encode($services);
?>
