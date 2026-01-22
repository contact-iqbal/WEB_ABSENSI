-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 22, 2026 at 06:27 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dna_absensi`
--

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE `config` (
  `nama_perusahaan` varchar(100) DEFAULT NULL,
  `alamat_perusahaan` longtext,
  `no_telp_perusahaan` int DEFAULT NULL,
  `email_perusahaan` varchar(100) DEFAULT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_pulang` time DEFAULT NULL,
  `toleransi_telat` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`nama_perusahaan`, `alamat_perusahaan`, `no_telp_perusahaan`, `email_perusahaan`, `jam_masuk`, `jam_pulang`, `toleransi_telat`) VALUES
('DNA Jaya Group', NULL, NULL, NULL, '08:00:00', '17:00:00', 15);

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `id` int NOT NULL,
  `nama` varchar(120) NOT NULL,
  `jabatan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'karyawan',
  `devisi` enum('default','DNA','RT') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('default','pegawai_tetap') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `profile_picture` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `acc_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NIK` int NOT NULL,
  `tempat_lahir` varchar(80) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kel` enum('laki_laki','perempuan') DEFAULT NULL,
  `agama` enum('islam','kristen','hindu','budha','katolik','konghucu') DEFAULT NULL,
  `alamat` longtext,
  `email` varchar(100) DEFAULT NULL,
  `no_telp` varchar(25) DEFAULT NULL,
  `gaji_pokok` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `karyawan`
--

INSERT INTO `karyawan` (`id`, `nama`, `jabatan`, `devisi`, `status`, `profile_picture`, `acc_created`, `NIK`, `tempat_lahir`, `tanggal_lahir`, `jenis_kel`, `agama`, `alamat`, `email`, `no_telp`, `gaji_pokok`) VALUES
(1, 'admin', 'superadmin', 'default', 'default', 'https://s3.getstickerpack.com/storage/uploads/sticker-pack/wielino-pack-01/sticker_20.png?d234a22dce20ea9317b0ba8c556b98e0&d=200x200', '2026-01-22 03:35:21', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(2, 'M Iqbal Ramadhan', 'bendahara', 'DNA', 'default', '', '2026-01-22 03:35:21', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(3, 'karyawan', 'karyawan', 'RT', 'pegawai_tetap', 'https://images.pexels.com/photos/28442318/pexels-photo-28442318/free-photo-of-confident-businessman-in-formal-suit-portrait.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500', '2026-01-22 03:35:21', 0, NULL, NULL, NULL, NULL, NULL, NULL, '081234567890', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(120) NOT NULL,
  `password` varchar(120) NOT NULL,
  `type` enum('pegawai','admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `type`) VALUES
(1, 'admin', '$2b$12$R06zEf0FevGHRrNH0FHNvOiadk6RQxCorLmmBlx4s7Gg6P2iSX6Cm', 'admin'),
(2, 'iqbalbal', '$2b$12$MsXFnS7jCP6cH0OMdGDS0.wbX8J7d95UuYCscLJOe5yM/PHTdIqw2', 'pegawai'),
(3, 'username', '$2b$12$W2rWB877FWIgnEQj6dWELe6MV5OCEsoU4oZR6rbleBsG4rOl5X3EG', 'pegawai');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD UNIQUE KEY `dupli` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD CONSTRAINT `idkaryawan` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
