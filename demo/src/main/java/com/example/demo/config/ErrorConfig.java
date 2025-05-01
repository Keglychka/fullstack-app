package com.example.demo.config;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
public class ErrorConfig implements ErrorController {

    private static final Logger LOGGER = Logger.getLogger(ErrorConfig.class.getName());

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        StringBuilder errorDetails = new StringBuilder();
        errorDetails.append("Error Status: ").append(status).append("\n");
        errorDetails.append("Error Message: ").append(message != null ? message : "No message").append("\n");
        errorDetails.append("Exception: ").append(exception != null ? exception.toString() : "No exception").append("\n");

        LOGGER.severe("Error occurred: " + errorDetails);
        if (exception instanceof Exception) {
            ((Exception) exception).printStackTrace();
        }

        if (status != null && Integer.valueOf(status.toString()) == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
            return "Internal Server Error: " + errorDetails;
        }
        return errorDetails.toString();
    }
}