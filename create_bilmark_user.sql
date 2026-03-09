-- Insert user with recruiter role for bilmark0730@gmail.com
-- Password: 'password' (hashed with Laravel's default bcrypt)
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `location`, `bio`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(6, 'Bilmark Recruiter', 'bilmark0730@gmail.com', NULL, NULL, NULL, 'recruiter', NOW(), '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NOW(), NOW());
