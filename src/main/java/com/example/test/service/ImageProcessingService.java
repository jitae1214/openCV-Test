package com.example.test.service;

import com.example.test.model.FilterState;
import org.bytedeco.opencv.opencv_core.*;
import org.bytedeco.opencv.global.opencv_imgproc;
import org.bytedeco.opencv.global.opencv_imgcodecs;
import static org.bytedeco.opencv.global.opencv_core.*;
import static org.bytedeco.opencv.global.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_imgcodecs.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
public class ImageProcessingService {
    
    private static final String UPLOAD_DIR = "uploads/";
    private Map<String, FilterState> filterStates = new HashMap<>();
    // 메모리에 저장된 처리된 이미지들
    private Map<String, byte[]> processedImages = new HashMap<>();
    
    public ImageProcessingService() {
        // 업로드 디렉토리만 생성
        createDirectories();
    }
    
    private void createDirectories() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    public String uploadImage(MultipartFile file) throws IOException {
        // 한글 파일명 문제를 해결하기 위해 확장자만 추출
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // 영문 파일명으로 생성
        String fileName = UUID.randomUUID().toString() + extension;
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.copy(file.getInputStream(), filePath);
        
        // 필터 상태 초기화
        filterStates.put(fileName, new FilterState(fileName));
        
        return fileName;
    }
    
    // 개별 필터 메소드들은 제거 - applyAllFilters에서 통합 처리
    
    public byte[] getImageBytes(String fileName) throws IOException {
        // 메모리에서 처리된 이미지가 있으면 반환
        byte[] processedImage = processedImages.get(fileName);
        if (processedImage != null) {
            return processedImage;
        }
        
        // 없으면 원본 이미지 반환
        return getUploadedImageBytes(fileName);
    }
    
    public byte[] getUploadedImageBytes(String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        return Files.readAllBytes(filePath);
    }
    
    public void deleteImage(String fileName) {
        try {
            Files.deleteIfExists(Paths.get(UPLOAD_DIR + fileName));
            filterStates.remove(fileName);
            processedImages.remove(fileName); // 메모리에서도 제거
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    // 활성화된 모든 필터를 순서대로 누적 적용 (메모리에서만 처리)
    public byte[] applyAllFilters(String fileName) {
        FilterState filterState = filterStates.get(fileName);
        if (filterState == null || filterState.isEmpty()) {
            // 필터가 없으면 원본 이미지를 바이트 배열로 반환
            try {
                return getUploadedImageBytes(fileName);
            } catch (IOException e) {
                throw new RuntimeException("원본 이미지 읽기 실패: " + e.getMessage());
            }
        }

        // 원본 이미지 로드
        String originalPath = UPLOAD_DIR + fileName;
        Mat source = imread(originalPath);
        if (source.empty()) {
            throw new RuntimeException("원본 이미지를 읽을 수 없습니다: " + originalPath);
        }

        Mat result = source.clone();

        // 사용자 정의 순서로 필터 적용
        List<String> activeFiltersInOrder = filterState.getActiveFiltersInOrder();
        for (String filter : activeFiltersInOrder) {
            switch (filter) {
                case "grayscale":
                    applyGrayscaleFilter(result, filterState);
                    break;
                case "blur":
                    applyBlurFilter(result, filterState);
                    break;
                case "edges":
                    applyEdgesFilter(result, filterState);
                    break;
                case "brightness":
                    applyBrightnessFilter(result, filterState);
                    break;
                case "histogram":
                    applyHistogramFilter(result, filterState);
                    break;
                case "sepia":
                    applySepiaFilter(result, filterState);
                    break;
                case "sharpen":
                    applySharpenFilter(result, filterState);
                    break;
                case "saturation":
                    applySaturationFilter(result, filterState);
                    break;
                case "noise":
                    applyNoiseFilter(result, filterState);
                    break;
                case "invert":
                    applyInvertFilter(result, filterState);
                    break;
            }
        }

        // 결과를 바이트 배열로 변환
        byte[] imageBytes = matToBytes(result);
        
        // 메모리에 저장
        processedImages.put(fileName, imageBytes);

        source.release();
        result.release();

        return imageBytes;
    }
    
    // Mat을 바이트 배열로 변환
    private byte[] matToBytes(Mat mat) {
        // 시스템 임시 폴더 사용
        try {
            Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
            String tempFileName = "opencv_temp_" + System.currentTimeMillis() + ".jpg";
            Path tempFile = tempDir.resolve(tempFileName);
            
            imwrite(tempFile.toString(), mat);
            byte[] bytes = Files.readAllBytes(tempFile);
            Files.deleteIfExists(tempFile); // 임시 파일 삭제
            return bytes;
        } catch (IOException e) {
            throw new RuntimeException("이미지 변환 실패: " + e.getMessage());
        }
    }
    
    // 메모리에서 처리된 이미지 가져오기
    public byte[] getProcessedImageBytes(String fileName) {
        return processedImages.get(fileName);
    }
    
    // 처리된 이미지 다운로드용 파일명 생성
    public String getDownloadFileName(String fileName) {
        FilterState filterState = filterStates.get(fileName);
        if (filterState == null) return fileName;
        
        StringBuilder downloadName = new StringBuilder("processed_");
        
        // 활성화된 필터들을 파일명에 포함
        boolean hasActiveFilters = false;
        if (filterState.isFilterActive("grayscale")) {
            downloadName.append("grayscale_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("blur")) {
            downloadName.append("blur_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("edges")) {
            downloadName.append("edges_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("brightness")) {
            downloadName.append("brightness_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("histogram")) {
            downloadName.append("histogram_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("sepia")) {
            downloadName.append("sepia_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("sharpen")) {
            downloadName.append("sharpen_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("saturation")) {
            downloadName.append("saturation_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("noise")) {
            downloadName.append("noise_");
            hasActiveFilters = true;
        }
        if (filterState.isFilterActive("invert")) {
            downloadName.append("invert_");
            hasActiveFilters = true;
        }
        
        if (!hasActiveFilters) {
            downloadName.append("original_");
        }
        
        downloadName.append(fileName);
        return downloadName.toString();
    }
    
    // 개별 필터 적용 메소드들
    private void applyGrayscaleFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("grayscale");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        cvtColor(result, result, COLOR_BGR2GRAY);
        cvtColor(result, result, COLOR_GRAY2BGR);
        result.convertTo(result, -1, intensityValue, 0);
    }
    
    private void applyBlurFilter(Mat result, FilterState filterState) {
        Object kernelSize = filterState.getFilterValue("blur");
        int blurValue = kernelSize != null ? (Integer) kernelSize : 5;
        GaussianBlur(result, result, new Size(blurValue, blurValue), 0);
    }
    
    private void applyEdgesFilter(Mat result, FilterState filterState) {
        Object threshold = filterState.getFilterValue("edges");
        int edgeThreshold = threshold != null ? (Integer) threshold : 100;
        
        Mat gray = new Mat();
        Mat edges = new Mat();
        cvtColor(result, gray, COLOR_BGR2GRAY);
        Canny(gray, edges, edgeThreshold, edgeThreshold * 1.5);
        cvtColor(edges, result, COLOR_GRAY2BGR);
        gray.release();
        edges.release();
    }
    
    private void applyBrightnessFilter(Mat result, FilterState filterState) {
        Object alpha = filterState.getFilterValue("brightness_alpha");
        Object beta = filterState.getFilterValue("brightness_beta");
        
        double alphaValue = alpha != null ? (Double) alpha : 1.0;
        double betaValue = beta != null ? (Double) beta : 0.0;
        
        result.convertTo(result, -1, alphaValue, betaValue);
    }
    
    private void applyHistogramFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("histogram");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        Mat gray = new Mat();
        Mat equalized = new Mat();
        cvtColor(result, gray, COLOR_BGR2GRAY);
        equalizeHist(gray, equalized);
        cvtColor(equalized, result, COLOR_GRAY2BGR);
        result.convertTo(result, -1, intensityValue, 0);
        gray.release();
        equalized.release();
    }
    
    private void applySepiaFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("sepia");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        Mat gray = new Mat();
        cvtColor(result, gray, COLOR_BGR2GRAY);
        cvtColor(gray, result, COLOR_GRAY2BGR);
        result.convertTo(result, -1, intensityValue, 30);
        gray.release();
    }
    
    private void applySharpenFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("sharpen");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        Mat kernel = new Mat(3, 3, CV_32F);
        kernel.ptr(0).putFloat(0.0f);
        kernel.ptr(0).putFloat(-1.0f);
        kernel.ptr(0).putFloat(0.0f);
        kernel.ptr(1).putFloat(-1.0f);
        kernel.ptr(1).putFloat(5.0f);
        kernel.ptr(1).putFloat(-1.0f);
        kernel.ptr(2).putFloat(0.0f);
        kernel.ptr(2).putFloat(-1.0f);
        kernel.ptr(2).putFloat(0.0f);
        
        Mat sharpened = new Mat();
        filter2D(result, sharpened, -1, kernel);
        addWeighted(result, 1.0 - intensityValue, sharpened, intensityValue, 0.0, result);
        
        kernel.release();
        sharpened.release();
    }
    
    private void applySaturationFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("saturation");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        // 간단한 채도 조정: 그레이스케일 변환 후 원본과 블렌딩
        Mat gray = new Mat();
        cvtColor(result, gray, COLOR_BGR2GRAY);
        cvtColor(gray, gray, COLOR_GRAY2BGR);
        
        addWeighted(result, intensityValue, gray, 1.0 - intensityValue, 0.0, result);
        
        gray.release();
    }
    
    private void applyNoiseFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("noise");
        int noiseValue = intensity != null ? (Integer) intensity : 10;
        
        // 간단한 노이즈 효과: 밝기 조정으로 시뮬레이션
        result.convertTo(result, -1, 1.0, noiseValue);
        
        // 값 범위 제한
        result.convertTo(result, -1, 1.0, 0);
    }
    
    private void applyInvertFilter(Mat result, FilterState filterState) {
        Object intensity = filterState.getFilterValue("invert");
        double intensityValue = intensity != null ? (Double) intensity : 1.0;
        
        Mat inverted = new Mat();
        bitwise_not(result, inverted);
        
        addWeighted(result, 1.0 - intensityValue, inverted, intensityValue, 0.0, result);
        
        inverted.release();
    }
    
    // 필터 활성화 상태 설정 메소드 (새로운 구조용)
    public void setFilterActive(String fileName, String filterName, boolean active) {
        FilterState filterState = filterStates.get(fileName);
        if (filterState != null) {
            filterState.setFilterActive(filterName, active);
        }
    }
    
    public void resetFilters(String fileName) {
        FilterState filterState = filterStates.get(fileName);
        if (filterState != null) {
            filterState.clear();
        }
    }
    
    public FilterState getFilterState(String fileName) {
        return filterStates.get(fileName);
    }
} 