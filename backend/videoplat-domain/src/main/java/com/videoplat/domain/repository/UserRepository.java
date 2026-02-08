package com.videoplat.domain.repository;

import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.UserOnlineStatus;
import com.videoplat.domain.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问层
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    // 新增：根据在线状态查询用户
    List<User> findByOnlineStatus(UserOnlineStatus onlineStatus);

    // 新增：根据角色查询用户
    List<User> findByRole(UserRole role);

    // 新增：分页查询用户
    Page<User> findAll(Pageable pageable);
}
