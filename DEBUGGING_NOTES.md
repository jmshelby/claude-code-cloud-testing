# Maven Proxy Issue - Debugging Notes

## Problem
Maven cannot download dependencies due to network configuration issues.

## Root Cause Analysis

### 1. DNS Configuration
- **/etc/resolv.conf is empty** - No DNS servers configured
- This causes "Temporary failure in name resolution" errors when attempting direct connections

### 2. Proxy Configuration
The environment has an HTTP/HTTPS proxy configured:
- **Proxy Host**: 21.0.0.85
- **Proxy Port**: 15004
- **Authentication**: Basic auth with JWT token as password
- **Environment Variables**: HTTP_PROXY, HTTPS_PROXY are set

### 3. TLS/SSL Certificate Issue
The proxy performs TLS interception and presents a certificate that isn't trusted by the system:
```
CERTIFICATE_VERIFY_FAILED
```

## What Works

### ✅ curl (with -k flag)
```bash
curl -sk https://repo.maven.apache.org/maven2/...
```
Works perfectly when skipping certificate verification.

### ✅ wget (with --no-check-certificate)
```bash
wget --no-check-certificate https://repo.maven.apache.org/maven2/...
```
Downloads files successfully through the proxy.

## What Doesn't Work

### ❌ Maven
Despite configuring:
- Proxy settings in `~/.m2/settings.xml`
- JVM proxy system properties (`-Dhttp.proxyHost`, etc.)
- SSL verification bypass attempts (`-Dmaven.wagon.http.ssl.insecure=true`)

Maven still fails with:
```
status code: 401, reason phrase: Unauthorized (401)
```

## Attempts Made

1. ✅ Created Maven settings.xml with proxy configuration
2. ✅ Verified proxy credentials are being passed to Maven
3. ✅ Attempted to disable SSL verification via multiple methods
4. ✅ Tried JVM system properties for proxy
5. ❌ All approaches still result in 401 Unauthorized

## Technical Details

Maven's HTTP transport (org.eclipse.aether.transport.http.HttpTransporter) connects to the proxy but receives 401 responses. Debug output shows:

```
[DEBUG] Using connector BasicRepositoryConnector ... via 21.0.0.85:15004
        with username=container_container_011CUuSDsj7gmPjLDjrtgYbw--claude_code_remote--unripe-subtle-every-issues,
        password=***
```

This indicates Maven IS using the proxy, but something about Maven's Apache HttpClient implementation isn't compatible with the proxy's authentication or SSL handling.

## Potential Workarounds

### Option 1: Manual Dependency Download
Use wget to download dependencies and place them in `~/.m2/repository`:

```bash
# Download a dependency
wget --no-check-certificate \
  https://repo.maven.apache.org/maven2/org/json/json/20231013/json-20231013.jar \
  -P ~/.m2/repository/org/json/json/20231013/

# Download POM
wget --no-check-certificate \
  https://repo.maven.apache.org/maven2/org/json/json/20231013/json-20231013.pom \
  -P ~/.m2/repository/org/json/json/20231013/
```

### Option 2: Use Gradle
Gradle might handle the proxy differently. Worth testing if it works where Maven fails.

### Option 3: Fix the Proxy
The proxy needs to either:
- Accept Maven's HTTP client authentication method
- Provide a trusted SSL certificate
- Allow a passthrough for maven repositories

## Files Modified

1. `/root/.m2/settings.xml` - Maven proxy configuration
2. Environment variables attempted via MAVEN_OPTS

## Recommendations

1. **Investigate proxy logs** to see why it's returning 401 for Maven but 200 for curl/wget
2. **Check if proxy supports** Maven's Apache HttpClient user agent or authentication headers
3. **Consider adding Maven Central** to proxy bypass list (NO_PROXY)
4. **Test with Gradle** as alternative build tool
5. **Implement dependency mirroring** or caching solution
