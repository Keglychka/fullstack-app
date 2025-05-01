package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    @GetMapping(value = {"/",
            "/posts",
            "/posts/{id}",
            "/login",
            "/register",
            "/posts/create",
            "/posts/edit/{id}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}