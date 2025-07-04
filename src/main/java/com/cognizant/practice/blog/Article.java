package com.cognizant.practice.blog;

import java.time.LocalDateTime;
import java.util.UUID;

public record Article(UUID id, String title, String content, LocalDateTime createdDate, LocalDateTime updatedDate) {

}
