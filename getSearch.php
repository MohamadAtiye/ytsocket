
<?php
if(isset($_GET['q'])){
    $xml = file_get_contents("https://www.youtube.com/search_ajax?style=json&embeddable=1&search_query=".$_GET['q']);
    echo $xml;
}
else{
    echo '{"hits":0,"video":[]}';
}
?>