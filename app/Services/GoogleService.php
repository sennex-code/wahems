<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Sheets;

class GoogleService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();

        $this->client->setAuthConfig(config('services.google.key_json'));

        $this->client->setScopes([
            Calendar::CALENDAR,
            Sheets::SPREADSHEETS,
        ]);


        $this->client->setSubject('info@wah.ph');
    }

    public function calendar()
    {
        return new Calendar($this->client);
    }

    public function sheets()
    {
        return new Sheets($this->client);
    }
}
