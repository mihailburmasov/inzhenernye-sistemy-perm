<?php
header('Content-Type: application/json; charset=utf-8');

function respond($ok, $message) {
    http_response_code($ok ? 200 : 400);
    echo json_encode(array('ok' => $ok, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Метод не поддерживается.');
}

/* Honeypot: настоящие посетители это поле не видят и не заполняют. */
if (!empty($_POST['website'])) {
    respond(true, 'Заявка отправлена.');
}

$clean = function ($s) {
    return trim(preg_replace('/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/', ' ', (string) $s));
};

$name    = isset($_POST['name']) ? $clean($_POST['name']) : '';
$phone   = isset($_POST['phone']) ? $clean($_POST['phone']) : '';
$email   = isset($_POST['email']) ? $clean($_POST['email']) : '';
$message = isset($_POST['message']) ? $clean($_POST['message']) : '';
$consent = isset($_POST['consent']) && $_POST['consent'] === '1';

if ($name === '' || $phone === '' || $email === '') {
    respond(false, 'Заполните имя, телефон и e-mail.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Проверьте e-mail — похоже, в нём опечатка.');
}
if (!$consent) {
    respond(false, 'Нужно согласие на обработку персональных данных.');
}

/* Получатель заявок. По умолчанию — info@n159.ru; уточнить у клиента, куда
   именно направлять заявки с сайта (можно указать несколько через запятую). */
$to = 'info@n159.ru';
$fromEmail = 'noreply@n159.ru';
$fromName = 'Сайт «Инженерные системы»';
$subject = 'Заявка с сайта n159.ru';

$bodyText = implode("\n", array(
    'Имя: ' . $name,
    'Телефон: ' . $phone,
    'E-mail: ' . $email,
    'Сообщение: ' . ($message !== '' ? $message : '—'),
));

$encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';
$headers = "From: {$encodedFromName} <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$sent = @mail($to, $encodedSubject, $bodyText, $headers);

if (!$sent) {
    respond(false, 'Не удалось отправить письмо. Позвоните нам по телефону, указанному на сайте.');
}

respond(true, 'Спасибо! Мы свяжемся с вами в ближайшее время.');
