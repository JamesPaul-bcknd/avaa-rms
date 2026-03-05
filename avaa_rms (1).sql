-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2026 at 02:02 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `avaa_rms`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-3PVx57uFQ5fHov36', 'a:1:{s:11:\"valid_until\";i:1772165472;}', 1773373512),
('laravel-cache-7vZCG4R6oesdVcCC', 'a:1:{s:11:\"valid_until\";i:1772252113;}', 1773461773),
('laravel-cache-cGw2OMmubXblLNui', 'a:1:{s:11:\"valid_until\";i:1772084368;}', 1773291088);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_postings`
--

CREATE TABLE `job_postings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `initials` varchar(5) NOT NULL,
  `color` varchar(7) NOT NULL,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `time_ago` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`tags`)),
  `salary` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `what_youll_do` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`what_youll_do`)),
  `why_company` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`why_company`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_postings`
--

INSERT INTO `job_postings` (`id`, `initials`, `color`, `title`, `company`, `location`, `time_ago`, `type`, `tags`, `salary`, `description`, `what_youll_do`, `why_company`, `created_at`, `updated_at`) VALUES
(1, 'TN', '#1e3a4f', 'Senior Frontend Developer', 'TechNova', 'San Francisco, CA', '2d ago', 'Full-time', '[\"React\",\"TypeScript\",\"Tailwind CSS\"]', '$120k-$160k', 'Join TechNova to lead the frontend architecture of our next-gen data platform. We\'re looking for a Senior React Developer who obsesses over clean code.', '[\"Architect reusable React components\",\"Set frontend best practices\",\"Work directly with Design\"]', '[\"High Growth: zero legacy code\",\"100% remote-first\",\"Equity and full benefits\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(2, 'DS', '#7EB0AB', 'Backend Engineer', 'DataStream', 'New York, NY', '3d ago', 'Full-time', '[\"Node.js\",\"PostgreSQL\",\"AWS\"]', '$130k-$170k', 'Build robust, scalable APIs that power real-time data pipelines using Node.js and PostgreSQL.', '[\"Design RESTful and GraphQL APIs\",\"Optimize database queries\",\"Collaborate with DevOps\"]', '[\"Process millions of events\",\"Dedicated learning budget\",\"Comprehensive benefits\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(3, 'CH', '#1e3a4f', 'UX/UI Designer', 'CreativeHub', 'Remote', '4d ago', 'Contract', '[\"Figma\",\"User Research\",\"Prototyping\"]', '$90k-$120k', 'Craft intuitive and visually stunning interfaces. Lead user research and create wireframes in Figma.', '[\"Conduct usability testing\",\"Create high-fidelity mockups\",\"Ensure design fidelity\"]', '[\"Creative Freedom\",\"Remote-First\",\"Performance bonuses\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(4, 'CS', '#2a5a6e', 'DevOps Engineer', 'CloudScale', 'Austin, TX', '5d ago', 'Full-time', '[\"Kubernetes\",\"Docker\",\"Terraform\"]', '$140k-$180k', 'Build and maintain cloud infrastructure with Kubernetes and Terraform to ensure 99.99% uptime.', '[\"Design CI\\/CD pipelines\",\"Monitor cloud infrastructure\",\"Implement IaC\"]', '[\"Manage scale for 50M+ users\",\"Strong engineering culture\",\"Stock options\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(5, 'AX', '#6366f1', 'Mobile Developer (React Native)', 'AppAxis', 'Los Angeles, CA', '1d ago', 'Full-time', '[\"React Native\",\"TypeScript\",\"iOS\",\"Android\"]', '$110k-$150k', 'Own the full mobile stack from UI to deployment on both iOS and Android stores.', '[\"Maintain cross-platform apps\",\"Integrate third-party SDKs\",\"Manage App Store releases\"]', '[\"5M+ active users\",\"Greenfield React Native\",\"Wellness stipend\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(6, 'NL', '#0ea5e9', 'Data Scientist', 'NeuraLabs', 'Boston, MA', '1d ago', 'Full-time', '[\"Python\",\"Machine Learning\",\"TensorFlow\"]', '$135k-$175k', 'Build predictive models and drive data-informed product decisions using state-of-the-art ML.', '[\"Deploy ML models\",\"Analyze large datasets\",\"Collaborate with Product\"]', '[\"Publish research papers\",\"GPU cluster access\",\"Research bonus\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(7, 'PH', '#1e3a4f', 'Product Manager', 'PivotHub', 'Remote', '6h ago', 'Full-time', '[\"Product Strategy\",\"Agile\",\"Analytics\"]', '$115k-$155k', 'Lead cross-functional teams and drive the product roadmap. Define strategy and prioritize features.', '[\"Define product vision\",\"Ship features on time\",\"Analyze product metrics\"]', '[\"Full autonomy\",\"Async culture\",\"Quarterly retreats\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(8, 'SG', '#ef4444', 'QA Engineer', 'ShieldGuard', 'Chicago, IL', '3d ago', 'Full-time', '[\"Selenium\",\"Cypress\",\"API Testing\"]', '$85k-$115k', 'Ensure reliability and security of fintech platform using automated end-to-end testing.', '[\"Design test plans\",\"Maintain automated suites\",\"Identify defects\"]', '[\"Protect financial transactions\",\"Clear career path\",\"Annual bonus\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(9, 'FL', '#7EB0AB', 'Full-Stack Developer', 'FlowLabs', 'Seattle, WA', '12h ago', 'Full-time', '[\"Next.js\",\"Node.js\",\"MongoDB\"]', '$125k-$165k', 'Build end-to-end features across SaaS platform using Next.js and MongoDB.', '[\"Build features DB to UI\",\"Optimize MongoDB schemas\",\"Architectural decisions\"]', '[\"Modern Stack (Next.js 14)\",\"High ownership\",\"Unlimited PTO\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(10, 'VP', '#8b5cf6', 'Technical Writer', 'VerbPro', 'Remote', '2d ago', 'Contract', '[\"Documentation\",\"API Docs\",\"Markdown\"]', '$70k-$95k', 'Create clear, developer-friendly documentation, guides, and tutorials for API platform.', '[\"Maintain API references\",\"Create onboarding content\",\"Work with engineering\"]', '[\"Huge developer audience\",\"Async-first workflow\",\"Contract renewal options\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(11, 'BF', '#f59e0b', 'Cybersecurity Analyst', 'ByteFortress', 'Washington, DC', '4d ago', 'Full-time', '[\"Security\",\"SIEM\",\"Penetration Testing\"]', '$100k-$140k', 'Protect critical infrastructure through threat analysis and penetration testing.', '[\"Analyze security events\",\"Conduct vulnerability tests\",\"Develop incident plans\"]', '[\"Protect gov systems\",\"Sponsors clearance\",\"Clearance bonus\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(12, 'GW', '#2a5a6e', 'Game Developer (Unity)', 'GridWorks', 'San Diego, CA', '1w ago', 'Full-time', '[\"Unity\",\"C#\",\"3D Graphics\"]', '$95k-$130k', 'Create immersive 3D experiences. Build gameplay systems and optimize rendering.', '[\"Develop mechanics in C#\",\"Optimize 3D performance\",\"Work with artists\"]', '[\"Original IP work\",\"Latest Unity LTS\",\"Profit sharing\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(13, 'EM', '#0d9488', 'Marketing Analyst', 'EchoMetrics', 'Miami, FL', '5d ago', 'Part-time', '[\"SQL\",\"Google Analytics\",\"Tableau\"]', '$55k-$75k', 'Turn campaign data into insights. Build dashboards and run A/B tests.', '[\"Build Tableau dashboards\",\"Analyze performance\",\"Run A\\/B tests\"]', '[\"Data-driven decisions\",\"Flexible schedule\",\"Performance bonuses\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(14, 'SF', '#1e3a4f', 'Solutions Architect', 'StackForge', 'Denver, CO', '3d ago', 'Full-time', '[\"AWS\",\"System Design\",\"Microservices\"]', '$150k-$200k', 'Design scalable cloud architectures and lead technical discovery for enterprise clients.', '[\"Document cloud-native arch\",\"Lead discovery sessions\",\"Guide engineering teams\"]', '[\"Senior leadership role\",\"Work across industries\",\"Consulting bonuses\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16'),
(15, 'PS', '#ec4899', 'Graphic Designer', 'PixelShift', 'Remote', '6d ago', 'Contract', '[\"Photoshop\",\"Illustrator\",\"Branding\"]', '$60k-$85k', 'Create visual assets for tech startups including branding and social media graphics.', '[\"Design brand identities\",\"Create marketing ads\",\"Iterate with clients\"]', '[\"Work with startup brands\",\"Creative freedom\",\"Extension options\"]', '2026-03-01 03:52:16', '2026-03-01 03:52:16');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_02_13_053608_create_personal_access_tokens_table', 1),
(5, '2026_02_19_000000_create_otp_codes_table', 1),
(6, '2026_02_23_000000_add_role_to_users_table', 1),
(7, '2026_02_23_050559_add_profile_fields_to_users_table', 1),
(8, '2026_03_01_114621_create_job_postings_table', 2),
(9, '2026_03_01_180455_create_saved_jobs_table', 3),
(10, '2026_03_01_233507_create_saved_jobs_table', 4);

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_codes`
--

INSERT INTO `otp_codes` (`id`, `email`, `otp`, `expires_at`, `created_at`) VALUES
(1, 'jpsalonga98@gmail.com', '458374', '2026-02-25 20:31:42', '2026-02-26 04:21:42');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_jobs`
--

INSERT INTO `saved_jobs` (`id`, `user_id`, `job_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, '2026-03-01 15:47:22', '2026-03-01 15:47:22'),
(2, 4, 2, '2026-03-01 15:47:36', '2026-03-01 15:47:36');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('ndaqxzSivJ4jhVZSizC8HB8EA5Ui1uQUUcHcmBTw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYmxYbkRwZWM5WG5RYWtXSTl2ODJ3U3NEcUZrYVJybG1JbmZXY3lQRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1772078649);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `location`, `bio`, `role`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Test User', 'test@example.com', NULL, NULL, NULL, 'user', '2026-02-25 20:03:05', '$2y$12$XcGe9DUA5tUUclACxWE82.ZTKNGQG/pAFasmTALMDY0wevVSAxp.u', 'HrZ9s903g4', '2026-02-25 20:03:06', '2026-02-25 20:03:06'),
(2, 'AVAA Admin', 'admin@avaa.com', NULL, NULL, NULL, 'admin', '2026-02-25 20:03:06', '$2y$12$BAFunedgfnlrqP6bU4Jev.wRyjjAqEUjBbr6HbUJcwyhyHImps0jW', 'DH4dtl9G8S', '2026-02-25 20:03:06', '2026-02-25 20:03:06'),
(4, 'James Paul Salonga', 'jpsalonga98@gmail.com', NULL, NULL, NULL, 'user', NULL, '$2y$12$7FEcg2jp41jSi.5HBNGrz.JAkk4yG6n2rfjpBkQXVZ8bmzmUivjFi', NULL, '2026-02-25 23:50:27', '2026-03-01 16:45:42'),
(5, 'HR Manager', 'hr@avaa.com', NULL, NULL, NULL, 'recruiter', '2026-03-04 22:35:00', '$2y$12$LwvihqrlmxsNljFG8TCkk.BEeK3TxEFcIeXmndEBiKHGMeZXRFNXi', NULL, '2026-03-04 22:35:00', '2026-03-04 22:35:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_postings`
--
ALTER TABLE `job_postings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_codes_email_index` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `saved_jobs_user_id_job_id_unique` (`user_id`,`job_id`),
  ADD KEY `saved_jobs_job_id_foreign` (`job_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `job_postings`
--
ALTER TABLE `job_postings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD CONSTRAINT `saved_jobs_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
