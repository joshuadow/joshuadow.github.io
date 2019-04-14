<?php
require_once "recaptchalib.php";

$secret = "6LcDKZ4UAAAAAIgD3x_3nY83rJclRgVzfDjSMzpo";

$response = null;

$reCaptcha = new ReCaptcha($secret);

if ($_POST["g-recaptcha-response"]) {
    $response = $reCaptcha->verifyResponse(
        $_SERVER["REMOTE_ADDR"],
        $_POST["g-recaptcha-response"]
    );
}
?>
