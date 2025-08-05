# Java 설치 가이드

## 🚀 Java 24 설치 방법

### 1. Java 다운로드
1. [Oracle Java SE 24](https://www.oracle.com/java/technologies/downloads/#java24) 또는 [OpenJDK 24](https://jdk.java.net/24/) 방문
2. Windows x64 Installer 다운로드

### 2. Java 설치
1. 다운로드한 설치 파일 실행
2. 설치 마법사의 지시에 따라 설치 진행
3. 기본 설치 경로: `C:\Program Files\Java\jdk-24`

### 3. 환경 변수 설정
1. Windows 키 + R → `sysdm.cpl` 입력 → 확인
2. "고급" 탭 → "환경 변수" 클릭
3. 시스템 변수에서 새로 만들기:
   - 변수 이름: `JAVA_HOME`
   - 변수 값: `C:\Program Files\Java\jdk-24`
4. 시스템 변수에서 `Path` 선택 → 편집 → 새로 만들기:
   - `%JAVA_HOME%\bin` 추가

### 4. 설치 확인
PowerShell에서 다음 명령어 실행:
```powershell
java -version
javac -version
echo $env:JAVA_HOME
```

## 🔧 대안: Chocolatey 사용
Chocolatey가 설치되어 있다면:
```powershell
choco install openjdk24
```

## 🔧 대안: SDKMAN 사용 (WSL)
WSL을 사용한다면:
```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 24-open
```

## ✅ 설치 완료 후
Java 설치가 완료되면 다음 명령어로 애플리케이션을 실행할 수 있습니다:
```powershell
./gradlew bootRun
```

## 🌐 웹사이트 접속
애플리케이션이 실행되면 브라우저에서 `http://localhost:8080` 접속 