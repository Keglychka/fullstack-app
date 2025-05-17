package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/Uploads/**")
                .addResourceLocations("file:D:/Учеба/4 курс/Курсовая/full/demo/target/classes/static/Uploads/")
                .setCachePeriod(0); // Отключаем кэширование
        System.out.println("Static resource location: file:D:/Учеба/4 курс/Курсовая/full/demo/target/classes/static/Uploads/");
    }

    @Override
    public void configureContentNegotiation(org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer configurer) {
        Map<String, MediaType> mediaTypes = new HashMap<>();
        mediaTypes.put("jpg", MediaType.IMAGE_JPEG);
        mediaTypes.put("jpeg", MediaType.IMAGE_JPEG);
        mediaTypes.put("png", MediaType.IMAGE_PNG);
        configurer.mediaTypes(mediaTypes);
    }
}