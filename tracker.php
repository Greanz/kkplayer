<?php
    if(isset($_POST['data'])){
        $data = json_decode($_POST['data']);
        /*
         * The song id is in $data->trackId
         */
        exit(json_encode([
            'done'=>'done',
            'track'=>$data->trackId
        ]));
    }