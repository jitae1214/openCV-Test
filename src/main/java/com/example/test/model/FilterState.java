package com.example.test.model;

import java.util.*;

public class FilterState {
    private String originalFileName;
    private Map<String, Boolean> activeFilters; // 효과별 ON/OFF
    private Map<String, Object> filterValues;   // 효과별 값
    private List<String> filterOrder; // 필터 적용 순서

    public FilterState(String originalFileName) {
        this.originalFileName = originalFileName;
        this.activeFilters = new HashMap<>();
        this.filterValues = new HashMap<>();
        this.filterOrder = new ArrayList<>();
        
        // 기본 필터 순서 설정
        this.filterOrder.addAll(Arrays.asList(
            "grayscale", "blur", "edges", "brightness", "histogram", 
            "sepia", "sharpen", "saturation", "noise", "invert"
        ));
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setFilterActive(String filterName, boolean active) {
        activeFilters.put(filterName, active);
    }

    public boolean isFilterActive(String filterName) {
        return activeFilters.getOrDefault(filterName, false);
    }

    public Map<String, Boolean> getActiveFilters() {
        return activeFilters;
    }

    public void setFilterValue(String filterName, Object value) {
        filterValues.put(filterName, value);
    }

    public Object getFilterValue(String filterName) {
        return filterValues.get(filterName);
    }

    public Map<String, Object> getFilterValues() {
        return filterValues;
    }

    public List<String> getFilterOrder() {
        return new ArrayList<>(filterOrder);
    }

    public void setFilterOrder(List<String> newOrder) {
        this.filterOrder = new ArrayList<>(newOrder);
    }

    public List<String> getActiveFiltersInOrder() {
        return filterOrder.stream()
                .filter(this::isFilterActive)
                .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    public boolean isEmpty() {
        return activeFilters.values().stream().noneMatch(v -> v);
    }

    public void clear() {
        activeFilters.clear();
        filterValues.clear();
    }
} 