package com.example.test.controller;

import com.example.test.service.ImageProcessingService;
import com.example.test.model.FilterState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ImageController {
    
    @Autowired
    private ImageProcessingService imageProcessingService;
    
    @GetMapping("/")
    public String index() {
        return "index";
    }
    
    @PostMapping("/upload")
    @ResponseBody
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        
        try {
            String fileName = imageProcessingService.uploadImage(file);
            response.put("success", "true");
            response.put("fileName", fileName);
            response.put("message", "이미지가 성공적으로 업로드되었습니다.");
        } catch (IOException e) {
            response.put("success", "false");
            response.put("message", "이미지 업로드 실패: " + e.getMessage());
        }
        
        return response;
    }
    

    

    
    @GetMapping("/uploads/{fileName}")
    public ResponseEntity<ByteArrayResource> getUploadedImage(@PathVariable String fileName) {
        try {
            byte[] imageBytes = imageProcessingService.getUploadedImageBytes(fileName);
            ByteArrayResource resource = new ByteArrayResource(imageBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/processed/{fileName}")
    public ResponseEntity<ByteArrayResource> getProcessedImage(@PathVariable String fileName) {
        try {
            byte[] imageBytes = imageProcessingService.getImageBytes(fileName);
            ByteArrayResource resource = new ByteArrayResource(imageBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/image/{fileName}")
    public ResponseEntity<ByteArrayResource> getImage(@PathVariable String fileName) {
        try {
            byte[] imageBytes = imageProcessingService.getImageBytes(fileName);
            ByteArrayResource resource = new ByteArrayResource(imageBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/filter/reset")
    @ResponseBody
    public Map<String, String> resetFilters(@RequestParam("fileName") String fileName) {
        Map<String, String> response = new HashMap<>();
        
        try {
            imageProcessingService.resetFilters(fileName);
            // 메모리에서 처리된 이미지 바이트 배열 반환
            byte[] processedImageBytes = imageProcessingService.applyAllFilters(fileName);
            response.put("success", "true");
            response.put("message", "모든 필터가 초기화되었습니다.");
        } catch (Exception e) {
            response.put("success", "false");
            response.put("message", "초기화 실패: " + e.getMessage());
        }
        
        return response;
    }
    
    @DeleteMapping("/image/{fileName}")
    @ResponseBody
    public Map<String, String> deleteImage(@PathVariable String fileName) {
        Map<String, String> response = new HashMap<>();
        
        try {
            imageProcessingService.deleteImage(fileName);
            response.put("success", "true");
            response.put("message", "이미지가 삭제되었습니다.");
        } catch (Exception e) {
            response.put("success", "false");
            response.put("message", "삭제 실패: " + e.getMessage());
        }
        
        return response;
    }

    @PostMapping("/filter/update")
    @ResponseBody
    public Map<String, String> updateFilters(
        @RequestParam("fileName") String fileName,
        @RequestBody Map<String, Object> filterData
    ) {
        Map<String, String> response = new HashMap<>();
        try {
            FilterState filterState = imageProcessingService.getFilterState(fileName);
            if (filterState == null) throw new RuntimeException("이미지 상태 없음");

            String[] filters = {"grayscale", "blur", "edges", "brightness", "histogram", "sepia", "sharpen", "saturation", "noise", "invert"};
            for (String filter : filters) {
                if (filterData.containsKey(filter)) {
                    Map<String, Object> filterInfo = (Map<String, Object>) filterData.get(filter);
                    boolean enabled = (Boolean) filterInfo.getOrDefault("enabled", false);
                    filterState.setFilterActive(filter, enabled);
                    
                    if (filterInfo.containsKey("value")) {
                        Object value = filterInfo.get("value");
                        if (filter.equals("blur") || filter.equals("edges") || filter.equals("noise")) {
                            filterState.setFilterValue(filter, Integer.parseInt(value.toString()));
                        } else if (filter.equals("brightness")) {
                            Map<String, Object> brightnessInfo = (Map<String, Object>) filterInfo.get("value");
                            double alpha = Double.parseDouble(brightnessInfo.get("alpha").toString());
                            double beta = Double.parseDouble(brightnessInfo.get("beta").toString());
                            filterState.setFilterValue("brightness_alpha", alpha);
                            filterState.setFilterValue("brightness_beta", beta);
                        } else {
                            filterState.setFilterValue(filter, Double.parseDouble(value.toString()));
                        }
                    }
                }
            }

            // 메모리에서 처리된 이미지 바이트 배열 반환
            byte[] processedImageBytes = imageProcessingService.applyAllFilters(fileName);
            response.put("success", "true");
            response.put("message", "필터가 적용되었습니다.");
        } catch (Exception e) {
            response.put("success", "false");
            response.put("message", "필터 적용 실패: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/filter/order")
    @ResponseBody
    public Map<String, String> updateFilterOrder(
        @RequestParam("fileName") String fileName,
        @RequestBody Map<String, Object> orderData
    ) {
        Map<String, String> response = new HashMap<>();
        try {
            FilterState filterState = imageProcessingService.getFilterState(fileName);
            if (filterState == null) throw new RuntimeException("이미지 상태 없음");

            @SuppressWarnings("unchecked")
            List<String> newOrder = (List<String>) orderData.get("order");
            filterState.setFilterOrder(newOrder);

            // 순서 변경 후 다시 필터 적용
            byte[] processedImageBytes = imageProcessingService.applyAllFilters(fileName);
            response.put("success", "true");
            response.put("message", "필터 순서가 변경되었습니다.");
        } catch (Exception e) {
            response.put("success", "false");
            response.put("message", "순서 변경 실패: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<ByteArrayResource> downloadImage(@PathVariable String fileName) {
        try {
            byte[] imageBytes = imageProcessingService.getProcessedImageBytes(fileName);
            if (imageBytes == null) {
                // 처리된 이미지가 없으면 원본 이미지 반환
                imageBytes = imageProcessingService.getUploadedImageBytes(fileName);
            }
            
            String downloadFileName = imageProcessingService.getDownloadFileName(fileName);
            ByteArrayResource resource = new ByteArrayResource(imageBytes);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadFileName + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 