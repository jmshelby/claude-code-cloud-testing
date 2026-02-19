#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install Clojure CLI if not present
if ! command -v clojure &> /dev/null; then
  echo "Installing Clojure CLI..."
  curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh
  chmod +x linux-install.sh
  ./linux-install.sh --prefix /usr/local
  rm linux-install.sh
fi

cd "$CLAUDE_PROJECT_DIR"

# Download Maven/Clojars dependencies via Python (Python urllib respects HTTPS_PROXY;
# Java's aether cannot resolve DNS through the proxy in this environment)
echo "Downloading Clojure dependencies..."
python3 - <<'PYEOF'
import urllib.request
import os
from pathlib import Path

M2 = Path.home() / ".m2" / "repository"
MAVEN = "https://repo1.maven.org/maven2"
CLOJARS = "https://clojars.org/repo"

def artifact_files(group, artifact, version):
    name = f"{artifact}-{version}"
    return [f"{name}.pom", f"{name}.pom.sha1", f"{name}.jar", f"{name}.jar.sha1"]

def download_artifact(repo, group_path, artifact, version):
    base = f"{repo}/{group_path}/{artifact}/{version}"
    dest_dir = M2 / group_path / artifact / version
    dest_dir.mkdir(parents=True, exist_ok=True)
    for filename in artifact_files(artifact, artifact, version):
        dest = dest_dir / filename
        url = f"{base}/{filename}"
        if dest.exists() and dest.stat().st_size > 0:
            continue
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"  Downloaded {group_path}/{artifact}/{version}/{filename}")
        except Exception as e:
            if dest.exists():
                dest.unlink()

# Maven Central artifacts (group, group_path, artifact, version)
maven_deps = [
    # Core Clojure
    ("org.clojure", "org/clojure", "clojure", "1.12.0"),
    ("org.clojure", "org/clojure", "clojure", "1.9.0"),
    ("org.clojure", "org/clojure", "spec.alpha", "0.5.238"),
    ("org.clojure", "org/clojure", "spec.alpha", "0.1.143"),
    ("org.clojure", "org/clojure", "core.specs.alpha", "0.4.74"),
    ("org.clojure", "org/clojure", "core.specs.alpha", "0.1.24"),
    # tools.cli
    ("org.clojure", "org/clojure", "tools.cli", "1.1.230"),
    ("org.clojure", "org/clojure", "tools.cli", "1.0.206"),
    # tools.namespace (test-runner dep)
    ("org.clojure", "org/clojure", "tools.namespace", "1.3.0"),
    ("org.clojure", "org/clojure", "java.classpath", "1.0.0"),
    ("org.clojure", "org/clojure", "tools.reader", "1.3.6"),
    ("org.clojure", "org/clojure", "tools.reader", "1.4.2"),
    # clj-kondo deps from Maven Central
    ("com.cognitect", "com/cognitect", "transit-clj", "1.0.333"),
    ("com.cognitect", "com/cognitect", "transit-java", "1.0.371"),
    ("com.fasterxml.jackson.core", "com/fasterxml/jackson/core", "jackson-core", "2.17.0"),
    ("com.fasterxml.jackson.dataformat", "com/fasterxml/jackson/dataformat", "jackson-dataformat-smile", "2.17.0"),
    ("com.fasterxml.jackson.dataformat", "com/fasterxml/jackson/dataformat", "jackson-dataformat-cbor", "2.17.0"),
    ("org.ow2.asm", "org/ow2/asm", "asm", "9.7"),
    ("com.github.javaparser", "com/github/javaparser", "javaparser-core", "3.26.1"),
    ("com.googlecode.json-simple", "com/googlecode/json-simple", "json-simple", "1.1.1"),
    ("org.msgpack", "org/msgpack", "msgpack", "0.6.12"),
    ("org.javassist", "org/javassist", "javassist", "3.18.1-GA"),
]

# Clojars artifacts
clojars_deps = [
    ("clj-kondo", "clj-kondo", "clj-kondo", "2024.11.14"),
    ("io.replikativ", "io/replikativ", "datalog-parser", "0.2.29"),
    ("cheshire", "cheshire", "cheshire", "5.13.0"),
    ("nrepl", "nrepl", "bencode", "1.2.0"),
    ("org.babashka", "org/babashka", "sci", "0.9.44"),
    ("babashka", "babashka", "fs", "0.5.21"),
    ("tigris", "tigris", "tigris", "0.1.2"),
    ("borkdude", "borkdude", "edamame", "1.4.27"),
    ("borkdude", "borkdude", "sci.impl.reflector", "0.0.3"),
    ("org.babashka", "org/babashka", "sci.impl.types", "0.0.2"),
]

for _, group_path, artifact, version in maven_deps:
    download_artifact(MAVEN, group_path, artifact, version)

for _, group_path, artifact, version in clojars_deps:
    download_artifact(CLOJARS, group_path, artifact, version)

print("Dependency download complete.")
PYEOF

# Verify classpath resolution works (reads from local cache only)
echo "Verifying classpath resolution..."
clojure -P
clojure -P -A:test
clojure -P -A:lint

echo "Session setup complete."
