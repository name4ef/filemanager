<?php
include 'chromephp/ChromePhp.php';

$data_dir = 'data';

class FileSystem {

    public function getFileList($dir) {
        $files = (scandir($dir));
        $file_list = [];
        foreach ($files as $f) {
            $path = $dir . DIRECTORY_SEPARATOR . $f;

            if (is_file($path)) {
                $obj = new stdClass();
                $obj->name = $f;
                $obj->size = filesize($path);
                $obj->mtime = filemtime($path);

                if ($this->_checkMimeType($path, 'text')) {
                    $obj->type = 'text';
                } else if ($this->_checkMimeType($path, 'image')) {
                    $obj->type = 'image';
                }

                $file_list[] = $obj;
            }
        }
        return $file_list;
    }

    public function removeFile($path) {
        unlink($path);
    }

    public function putFile($to) {
        $uploadfile = $to . basename($_FILES['file']['name']);
        $uploadfile = str_replace('+', '', $uploadfile);
        if (file_exists($uploadfile)) {
            ChromePhp::warn('file already exists');
            return false;
        }
        // TODO error handling
        // http://php.net/manual/ru/features.file-upload.errors.php
        if ($_FILES['file']['error'] == UPLOAD_ERR_OK) {
            move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile);
        } else {
            ChromePhp::warn($_FILES['file']);
            return false;
        }
        return true;
    }

    public function getFile($path) {
        if ($this->_checkMimeType($path, 'text')) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . basename($path) . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($path));
            echo readfile($path);
        } else if ($this->_checkMimeType($path, 'image')) {
            $type = pathinfo($path, PATHINFO_EXTENSION);
            $data = file_get_contents($path);
            $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            echo $base64;
        }
    }

    private function _checkMimeType($path, $type) {
        if (! is_file($path)) {
            return false;
        }
        $mime = mime_content_type($path);
        $checkedType = explode('/', $mime)[0];
        if ($type == $checkedType) {
            return true;
        } else {
            return false;
        }
    }

}

$fs = new FileSystem();

$req = json_decode($_REQUEST['q']);
switch ($req->action) {
case 'getFileList':
    $data['files'] = $fs->getFileList($data_dir);
    echo json_encode($data);
    break;
case 'removeFile':
    $fs->removeFile($data_dir . DIRECTORY_SEPARATOR . $req->filename);
    break;
case 'putFile':
    if ($fs->putFile($data_dir . DIRECTORY_SEPARATOR)) {
        echo 'file uploaded';
    } else {
        echo 'error';
    }
    break;
case 'getFile':
    $fs->getFile($data_dir . DIRECTORY_SEPARATOR . $req->filename);
    break;
}
/* vim: set foldmethod=indent foldlevel=1: */ 
