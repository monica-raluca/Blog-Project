package com.cognizant.practice.blog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value="/hello")
public class HelloController {

    @GetMapping
    public String printHello() {
        return "Hello world!\n";
    }

    @GetMapping(value="/{name}")
    public String printWithName(@PathVariable String name) {
        return "Hello " + name + "!!\n";
    }
}
