package com.example.test.config;

import org.bytedeco.javacpp.Loader;
import org.bytedeco.opencv.opencv_java;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("!test")
public class OpenCVConfig {
    @PostConstruct
    public void initOpenCV() {
        try {
            // bytedeco OpenCV 네이티브 라이브러리 로드
            Loader.load(opencv_java.class);
            System.out.println("OpenCV가 성공적으로 로드되었습니다");
        } catch (Exception e) {
            System.err.println("OpenCV 초기화 실패: " + e.getMessage());
        }
    }
} 