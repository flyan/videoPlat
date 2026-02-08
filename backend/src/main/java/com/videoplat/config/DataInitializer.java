package com.videoplat.config;

import com.videoplat.model.User;
import com.videoplat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化器
 *
 * 应用启动时自动创建测试用户
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 创建管理员测试账号
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .nickname("管理员")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(admin);
            log.info("创建测试用户: admin / admin123");
        }

        // 创建普通用户测试账号
        if (!userRepository.existsByUsername("user1")) {
            User user1 = User.builder()
                    .username("user1")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户1")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user1);
            log.info("创建测试用户: user1 / user123");
        }

        if (!userRepository.existsByUsername("user2")) {
            User user2 = User.builder()
                    .username("user2")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户2")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user2);
            log.info("创建测试用户: user2 / user123");
        }

        if (!userRepository.existsByUsername("user3")) {
            User user3 = User.builder()
                    .username("user3")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户3")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user3);
            log.info("创建测试用户: user3 / user123");
        }

        if (!userRepository.existsByUsername("user4")) {
            User user4 = User.builder()
                    .username("user4")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户4")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user4);
            log.info("创建测试用户: user4 / user123");
        }

        if (!userRepository.existsByUsername("user5")) {
            User user5 = User.builder()
                    .username("user5")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户5")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user5);
            log.info("创建测试用户: user5 / user123");
        }

        if (!userRepository.existsByUsername("user6")) {
            User user6 = User.builder()
                    .username("user6")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户6")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user6);
            log.info("创建测试用户: user6 / user123");
        }

        if (!userRepository.existsByUsername("user7")) {
            User user7 = User.builder()
                    .username("user7")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户7")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user7);
            log.info("创建测试用户: user7 / user123");
        }

        if (!userRepository.existsByUsername("user8")) {
            User user8 = User.builder()
                    .username("user8")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户8")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user8);
            log.info("创建测试用户: user8 / user123");
        }

        if (!userRepository.existsByUsername("user9")) {
            User user9 = User.builder()
                    .username("user9")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .nickname("用户9")
                    .userType(User.UserType.REGISTERED)
                    .build();
            userRepository.save(user9);
            log.info("创建测试用户: user9 / user123");
        }
    }
}
