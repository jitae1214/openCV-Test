# 🎨 Image Filter Studio

실시간 이미지 필터 처리 웹 애플리케이션으로, 드래그 앤 드롭으로 필터 순서를 자유롭게 조정할 수 있습니다.

## ✨ 주요 기능

### 🖼️ 이미지 처리
- **실시간 필터 적용**: 설정 변경 시 즉시 결과 확인
- **메모리 기반 처리**: 빠른 성능과 효율적인 메모리 사용
- **원본 보존**: 항상 원본 이미지에서 필터 적용

### 🎛️ 10가지 고급 필터
1. **⚫ 그레이스케일** - 흑백 변환 및 강도 조절
2. **🌫️ 블러** - 가우시안 블러 효과
3. **🔍 엣지 검출** - 경계선 강조 및 검출
4. **💡 밝기/대비** - 이미지 밝기와 대비 조절
5. **📊 히스토그램 평활화** - 대비 향상 및 선명도 개선
6. **🟤 세피아** - 빈티지 갈색 톤 효과
7. **🔪 선명도** - 이미지 샤프닝 효과
8. **🌈 채도** - 색상 채도 조절
9. **📺 노이즈** - 아티스틱 노이즈 효과
10. **🔄 반전** - 색상 반전 효과

### 🎯 직관적인 UI/UX
- **⬆️⬇️ 드래그 앤 드롭**: 필터 적용 순서 자유 변경
- **실시간 프리뷰**: 원본과 수정된 이미지 동시 비교
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **글래스모피즘**: 모던하고 세련된 UI 디자인

## 🚀 빠른 시작

### 필수 요구사항
- Java 17 이상
- Gradle 7.0 이상

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/yourusername/image-filter-studio.git
   cd image-filter-studio
   ```

2. **애플리케이션 실행**
   ```bash
   ./gradlew bootRun -x test
   ```

3. **브라우저에서 접속**
   ```
   http://localhost:8080
   ```

## 📖 사용법

### 1. 이미지 업로드
- **"이미지 선택하기"** 버튼을 클릭하여 이미지 업로드
- 지원 형식: JPG, PNG, BMP, TIFF

### 2. 필터 적용
- **체크박스**로 원하는 필터 ON/OFF
- **슬라이더**로 각 필터의 강도 조절
- **실시간 프리뷰**로 결과 확인

### 3. 순서 변경
- 필터 카드 좌측의 **⋮⋮ 핸들**을 드래그
- 위에서 아래 순서로 필터가 순차 적용

### 4. 이미지 저장
- **💾 이미지 다운로드** 버튼으로 결과 저장
- 파일명에 적용된 필터 자동 포함

### 5. 초기화
- **🔄 모든 필터 초기화** 버튼으로 설정 리셋

## 🏗️ 기술 스택

### Backend
- **Spring Boot 4.0** - 웹 프레임워크
- **OpenCV (ByteDeco)** - 이미지 처리 라이브러리
- **Java 24** - 프로그래밍 언어
- **Gradle** - 빌드 도구

### Frontend
- **Thymeleaf** - 템플릿 엔진
- **Vanilla JavaScript** - 클라이언트 로직
- **CSS3** - 스타일링 (글래스모피즘, 애니메이션)
- **HTML5 Drag & Drop API** - 드래그 앤 드롭 기능

### 이미지 처리
- **가우시안 블러**: 자연스러운 블러 효과
- **Canny 엣지 검출**: 정밀한 경계선 검출
- **히스토그램 평활화**: CLAHE 알고리즘 사용
- **색공간 변환**: BGR ↔ HSV ↔ 그레이스케일
- **컨볼루션 필터**: 커스텀 커널 적용

## 📁 프로젝트 구조

```
src/
├── main/
│   ├── java/com/example/test/
│   │   ├── config/
│   │   │   └── OpenCVConfig.java          # OpenCV 초기화
│   │   ├── controller/
│   │   │   └── ImageController.java       # REST API 엔드포인트
│   │   ├── model/
│   │   │   └── FilterState.java          # 필터 상태 관리
│   │   ├── service/
│   │   │   └── ImageProcessingService.java # 이미지 처리 로직
│   │   └── TestApplication.java           # 메인 애플리케이션
│   └── resources/
│       ├── templates/
│       │   └── index.html                 # 메인 웹 페이지
│       └── application.properties         # 설정 파일
└── test/
    └── java/com/example/test/
        └── TestApplicationTests.java      # 테스트
```

## 🛠️ API 엔드포인트

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | 메인 페이지 |
| `POST` | `/upload` | 이미지 업로드 |
| `POST` | `/filter/update` | 필터 설정 업데이트 |
| `POST` | `/filter/order` | 필터 순서 변경 |
| `POST` | `/filter/reset` | 모든 필터 초기화 |
| `GET` | `/download/{fileName}` | 처리된 이미지 다운로드 |
| `GET` | `/uploads/{fileName}` | 원본 이미지 조회 |
| `GET` | `/image/{fileName}` | 처리된 이미지 조회 |
| `DELETE` | `/image/{fileName}` | 이미지 삭제 |

## 🎯 성능 최적화

### 메모리 관리
- **임시 파일 최소화**: 시스템 tmp 폴더 활용
- **메모리 기반 처리**: 불필요한 디스크 I/O 제거
- **OpenCV Mat 해제**: 메모리 누수 방지

### 브라우저 최적화
- **캐시 방지**: 타임스탬프 기반 이미지 로딩
- **실시간 업데이트**: 설정 변경 시 즉시 반영
- **압축 전송**: JPEG 압축으로 전송 최적화

## 🎨 UI/UX 특징

### 디자인 시스템
- **글래스모피즘**: 반투명 효과와 블러 백드롭
- **그라데이션**: 일관된 색상 테마
- **마이크로 인터랙션**: 호버, 클릭, 드래그 애니메이션

### 접근성
- **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- **시각적 피드백**: 상태별 명확한 시각적 표시
- **반응형 레이아웃**: 다양한 화면 크기 지원

## 🔧 개발 환경 설정

### IDE 설정
```bash
# VS Code 추천 확장
- Extension Pack for Java
- Spring Boot Extension Pack
- HTML CSS Support
```

### 개발 서버 실행
```bash
# 개발 모드 (핫 리로드)
./gradlew bootRun --continuous

# 프로덕션 빌드
./gradlew build
```

### 트러블슈팅
```bash
# OpenCV 라이브러리 오류 시
./gradlew bootRun -x test

# 의존성 새로고침
./gradlew --refresh-dependencies clean build
```

## 📈 로드맵

### v2.0 계획
- [ ] **AI 기반 필터**: 딥러닝 기반 스타일 전송
- [ ] **배치 처리**: 여러 이미지 동시 처리
- [ ] **클라우드 저장**: AWS S3 연동
- [ ] **사용자 계정**: 필터 프리셋 저장

### v1.1 계획
- [ ] **더 많은 필터**: 빈티지, 네온, 수채화 효과
- [ ] **필터 프리셋**: 인기 조합 저장/불러오기
- [ ] **성능 모니터링**: 처리 시간 및 메모리 사용량 표시

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- **OpenCV** - 강력한 이미지 처리 라이브러리
- **Spring Boot** - 신속한 웹 개발 프레임워크
- **ByteDeco** - Java OpenCV 바인딩 제공

---

<div align="center">

**🎨 Image Filter Studio로 창의적인 이미지 편집을 경험해보세요! ✨**

</div>