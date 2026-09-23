<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
{{ config('app.name') }}
</x-mail::header>
</x-slot:header>

{{-- Body --}}


**Purpose of this email:**
This is a security notification sent to help you regain access to your account. We take your account security seriously and want to ensure that only you can reset your password.

**What to do next:**
Please click the button below to reset your password. This link is secure and will expire in 60 minutes for your protection.

{!! $slot !!}

**Important Security Notice:**
- This link is valid for 60 minutes only
- Do not share this link with anyone
- If you did not request a password reset, please ignore this email
- Your account will remain secure and no changes will be made

If you have any questions or concerns about your account security, please contact our support team.

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} {{ config('app.name') }}. {{ __('All rights reserved.') }}
<br>
This is an automated security email. Please do not reply to this message.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>