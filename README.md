# Lanschool-Air-Research





The logs are encrypted with this key:




-----BEGIN PUBLIC KEY-----





MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn9vekNvUv2HsJHkqElhI
wER2+C+WG8XFyqFt+wZ7w5522nK0I2I8TKUBSploYuiWOvCyczmFpKI9Rm480p/x
u2Vt7xJtkF9QznuwEMPx2NBQ6W8hFgsOjEo89EZ2x/KPuEoAP9EIBdTRfkYMASLi
OpTIHQJVe5azMbZheA+6DTUlYVBhy3uSuQ5jhe6EfVgrgBN1Hn3GGrrd3TGtQm5A
UNU4mLBqdZ8brTvP8Oyd0meB2rxCzUhjrORclgjU8im/uDBzp0uBOhG8U6XbcNWc
6YqQ+319WyD3FOsfAt/X9TIDEFYhoUzHZDuOh47JUIKiOKHJ+nco6wla3/nEd7Qr
FQIDAQAB





-----END PUBLIC KEY-----


\nTEACHER_CONFERENCE_TYPE_NONE: 0 (No conference).
TEACHER_CONFERENCE_TYPE_VIDEO: 1 (Video conference for teacher).
TEACHER_CONFERENCE_TYPE_AUDIO: 2 (Audio conference for teacher).
STUDENT_CONFERENCE_TYPE_VIDEO: 4 (Video conference for student).\n

deadbeef-4811-30f6-42e7-7d8421b2bece


\nenums
- **ConnectionStateEnum**:
  - `Connected`: 1
  - `Disconnected`: 2
  - `Trying`: 3

- **SigningRequirementEnum**:
  - `Enforced`: 1
  - `None`: 2
  - `Unknown`: 3

- **LEDColors**:
  - `Green`: 1
  - `Amber`: 2
  - `Red`: 3

- **LEDColorsString**:
  - `Green`: 'Green'
  - `Amber`: 'Amber'
  - `Red`: 'Red'

- **StatusPageIcons**:
  - `Good`: 1
  - `Warn`: 2
  - `Error`: 3
  - `Info`: 4

- **ConferenceStateEnum**:
  - `Disconnected`: 1
  - `InProcess`: 2
  - `Connected`: 3

- **RouteEnum**:
  - `Chat`: 'build/index.html#/chat'
  - `Speaker`: 'build/index.html#/speaker-audio'

consts
- **WebHelperExtensionIds**:
  - `baleiojnjpgeojohhhfbichcodgljmnj` (LanSchool Air web helper - production)
  - `ljejjhdjfagbhnehmnhihhkcbanajcoa` (LanSchool Air web helper - beta)
  - `mmpgfeapmofhobeagaffmjfnfaagjkbk` (LanSchool Air web helper - beta 2)
  - `omkignahognlejgkcbcmcpafacamikmp` (LanSchool Air web helper - beta 3)
  - `keknjhjnninjadlkapachhhjfmfnofcb` (Self-hosted extension)

- **CatchAllOrg**: `'deadbeef-4811-30f6-42e7-7d8421b2bece'` (Catch-all organization ID)

- **LogBufferSize**: `10000` (Maximum log buffer size)

- **MetricReporterMinimumReportingInterval**: `5000` ms (Minimum reporting interval for metrics)

- **MetricReporterCheckInterval**: `300000` ms (Metric reporting check interval)

- **MetricReporterConfigEndpoint**: `'0/lsa/common/metrics/config'` (Metric reporting config endpoint)

- **MetricReporterReportingEndpoint**: `'0/lsa/common/metrics/events'` (Metric reporting endpoint)

- **SyncStorageMaxErrorsBeforeThrottle**: `5` (Max errors before throttling sync storage)

- **SyncStorageDefaultInterval**: `1000` ms (Default sync storage interval)

- **SyncStorageThrottleBackOffAmount**: `5000` ms (Throttle back-off amount for sync storage)

- **SyncStorageThrottleMax**: `120000` ms (Maximum throttle duration for sync storage)
