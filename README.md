# Lanschool-Air-Research



Note: this repo isn't meant to be hacking/bypassing LanSchool Air (that can be done easily). We are just decompiling LanSchool Air and looking into the internal code which is fun.
Suprisingly, the code isin't ofuscated - there's literally comments in there.




![image](https://github.com/user-attachments/assets/0cdc2cff-009d-4acb-af3a-dccc4e28cea2)

It's all clean - easy to read, no bullshit or anything like that which is nice :)

![image](https://github.com/user-attachments/assets/6563a3d0-3dd6-4d87-943a-300285c81955)

Gotta love `TODO` comments in production ready code

![image](https://github.com/user-attachments/assets/60a06a13-e0a8-428f-a453-7f7d8c789a71)

crypto mine hehehehe




Alright serious shit now.
The logs are encrypted with this public key:


```
-----BEGIN PUBLIC KEY-----

MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn9vekNvUv2HsJHkqElhI
wER2+C+WG8XFyqFt+wZ7w5522nK0I2I8TKUBSploYuiWOvCyczmFpKI9Rm480p/x
u2Vt7xJtkF9QznuwEMPx2NBQ6W8hFgsOjEo89EZ2x/KPuEoAP9EIBdTRfkYMASLi
OpTIHQJVe5azMbZheA+6DTUlYVBhy3uSuQ5jhe6EfVgrgBN1Hn3GGrrd3TGtQm5A
UNU4mLBqdZ8brTvP8Oyd0meB2rxCzUhjrORclgjU8im/uDBzp0uBOhG8U6XbcNWc
6YqQ+319WyD3FOsfAt/X9TIDEFYhoUzHZDuOh47JUIKiOKHJ+nco6wla3/nEd7Qr
FQIDAQAB

-----END PUBLIC KEY-----
```

There seems to be generation of a private key in the code (keypair gen on config). Not sure, will look into it tomorrow.
However, the LanSchool documentation states you can email to them and they will decrypt the logs for you. Don't really know whats happening.

That means that they have the private key.


Below is datamining from some js files.

```js
TEACHER_CONFERENCE_TYPE_NONE: 0 (No conference).
TEACHER_CONFERENCE_TYPE_VIDEO: 1 (Video conference for teacher).
TEACHER_CONFERENCE_TYPE_AUDIO: 2 (Audio conference for teacher).
STUDENT_CONFERENCE_TYPE_VIDEO: 4 (Video conference for student).
```


```js
deadbeef-4811-30f6-42e7-7d8421b2bece
```

enums
```js
- ConnectionStateEnum:
  - `Connected`: 1
  - `Disconnected`: 2
  - `Trying`: 3

- SigningRequirementEnum:
  - `Enforced`: 1
  - `None`: 2
  - `Unknown`: 3

- LEDColors:
  - `Green`: 1
  - `Amber`: 2
  - `Red`: 3

- LEDColorsString:
  - `Green`: 'Green'
  - `Amber`: 'Amber'
  - `Red`: 'Red'

- StatusPageIcons:
  - `Good`: 1
  - `Warn`: 2
  - `Error`: 3
  - `Info`: 4

- ConferenceStateEnum:
  - `Disconnected`: 1
  - `InProcess`: 2
  - `Connected`: 3

- RouteEnum:
  - `Chat`: 'build/index.html#/chat'
  - `Speaker`: 'build/index.html#/speaker-audio'
```
consts
```
- WebHelperExtensionIds:
  - `baleiojnjpgeojohhhfbichcodgljmnj` (LanSchool Air web helper - production)
  - `ljejjhdjfagbhnehmnhihhkcbanajcoa` (LanSchool Air web helper - beta)
  - `mmpgfeapmofhobeagaffmjfnfaagjkbk` (LanSchool Air web helper - beta 2)
  - `omkignahognlejgkcbcmcpafacamikmp` (LanSchool Air web helper - beta 3)
  - `keknjhjnninjadlkapachhhjfmfnofcb` (Self-hosted extension)

- CatchAllOrg: `'deadbeef-4811-30f6-42e7-7d8421b2bece'` (Catch-all organization ID)

- LogBufferSize: `10000` (Maximum log buffer size)

- MetricReporterMinimumReportingInterval: `5000` ms (Minimum reporting interval for metrics)

- MetricReporterCheckInterval: `300000` ms (Metric reporting check interval)

- MetricReporterConfigEndpoint: `'0/lsa/common/metrics/config'` (Metric reporting config endpoint)

- MetricReporterReportingEndpoint: `'0/lsa/common/metrics/events'` (Metric reporting endpoint)

- SyncStorageMaxErrorsBeforeThrottle: `5` (Max errors before throttling sync storage)

- SyncStorageDefaultInterval: `1000` ms (Default sync storage interval)

- SyncStorageThrottleBackOffAmount: `5000` ms (Throttle back-off amount for sync storage)

- SyncStorageThrottleMax: `120000` ms (Maximum throttle duration for sync storage)
```


The extensions are intresting. Production (`baleiojnjpgeojohhhfbichcodgljmnj`) - searching the extension ID online shows up with a lot of stuff as expected. Searching the middle 3 (beta - beta3) come up with nothing - internal betas or a/b testing for admins/some schools???
The last one (`keknjhjnninjadlkapachhhjfmfnofcb`) comes up with a few, but not a lot.


What suprised us was, even before decrypting, we knew it was electron. So this is eating all of ram hehehe


More stuff but too lazy to type (gonna sleep now)

# Ghostboo124's part
```
{"os_crypt":{"audit_enabled":true,"encrypted_key":"RFBBUEkBAAAA0Iyd3wEV0RGMegDAT8KX6wEAAAB4eY8ERg3KQYIcJeDyuk/WEAAAABIAAABDAGgAcgBvAG0AaQB1AG0AAAAQZgAAAAEAACAAAAAxQc9mRY+n5sZCzBPZ/744elq8DqYs/WISU3joiFzokQAAAAAOgAAAAAIAACAAAAC/bQaAQjkbd0xpEwiTgB0Hk3VIIzG44xe0WWJtzX4flzAAAAAsGz9T1Otxr1UY1TxldgAFyjVlpigHUYPBD4iCjBYThkHHHAXDG8focMU5q+3NTkxAAAAAMs/XYx2CVPGhIor2qTtibBrJjYn3FgSQj+jDSbAqU7AeAlmTXn2L5EbRa6D4oBpdsAmQs32SKlFZnhA1F34TgQ=="}}
```
I Signed up for a free trial to LSAir, and I found this in `%APPDATA%\LSAirClient\Local State` (it is a file not a directory, wtf are you doing Lenovo, why are there spaces in the name) That is a base64 encrypted key, it is then DPAPI encrypted (If you want to read, here is the [C# documentation on it](https://learn.microsoft.com/en-us/dotnet/standard/security/how-to-use-data-protection) and here is a [wikipedia page for it](https://en.wikipedia.org/wiki/Data_Protection_API)) I can't seem to decrypt it either using a local machine or a user scoped decryption both for a local administrator and a local user (my main user) it might have been encrypted on Lenovo's side and then copied over here, then sent back to lenovo for decryption, not sure how though, will continue to look through the code

I have managed to decrypt it and it leads to this, all are decrypted:
```
Raw Key: b"5\xfa\x87Ak\x01\x11\x85B\xaf_\xcf.\xda\xb0\xc9G\xa1\x9a\xa4'\xf1\x98\xf8\xe7\rd\xd6e~\x00M"
Hex Key: 35fa87416b01118542af5fcf2edab0c947a19aa427f198f8e70d64d6657e004d
Base64 Key: NfqHQWsBEYVCr1/PLtqwyUehmqQn8Zj45w1k1mV+AE0=
```
