<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MedTechCertificateMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public $participant,
        public $event,
        public string $pdfBinary,
        public string $filename,
    ) {}

    public function build()
    {
        return $this->subject('Your Certificate from Wireless Access For Health')
            // this matches: resources/views/emails/medtext-cert-temp.blade.php
            ->view('emails.medtext-cert-temp')
            ->with([
                'participant' => $this->participant,
                'event' => $this->event,
            ])
            ->attachData($this->pdfBinary, $this->filename, [
                'mime' => 'application/pdf',
            ]);
    }
}