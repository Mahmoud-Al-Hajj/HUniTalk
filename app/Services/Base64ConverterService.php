<?php

namespace App\Services;


use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class Base64ConverterService{

    public static function base64ToImage(string $base64){
        [$type, $content] = explode(',', $base64);
        $extension = Str::after(Str::before($type, ';'), '/');
        $filename = Str::random(10) . '.' . $extension;

        Storage::disk('public')->put($filename, base64_decode($content));
        return url('storage/' . $filename);
    }

    public static function base64ArrayToImages(array $base64Array){
        $urls = [];

        foreach ($base64Array as $base64) {
            if (!empty($base64)) {
                $urls[] = self::base64ToImage($base64);
            }
        }

        return $urls;
    }

    public static function convert($input){
        if (is_array($input)) {
            return self::base64ArrayToImages($input);
        }

        return self::base64ToImage($input);
    }


}
