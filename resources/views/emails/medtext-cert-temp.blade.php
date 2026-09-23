<!doctype html>
<html>
  <body>

    <img src="{w}" alt="">
    <p>Hi {{ $participant->first_name }},</p>

    <p>
      Attached is your Certificate for:
      <strong>{{ $event->name }}</strong>.
    </p>

    <p>Thank you.</p>
  </body>
</html>