-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 23, 2026 at 04:48 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

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
-- Table structure for table `absensi`
--

CREATE TABLE `absensi` (
  `id` int NOT NULL,
  `tanggal` date NOT NULL,
  `absen_masuk` time DEFAULT NULL,
  `absen_keluar` time DEFAULT NULL,
  `status` enum('hadir','terlambat','izin','sakit','alpha') NOT NULL DEFAULT 'hadir',
  `keterangan` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `absensi`
--

INSERT INTO `absensi` (`id`, `tanggal`, `absen_masuk`, `absen_keluar`, `status`, `keterangan`, `created_at`) VALUES
(2, '2026-02-20', NULL, NULL, 'izin', 'Izin: izin (Pengen tidur)', '2026-02-20 06:20:03'),
(2, '2026-02-22', '08:10:00', NULL, 'hadir', NULL, '2026-02-22 02:26:56'),
(2, '2026-02-23', '08:10:00', NULL, 'hadir', NULL, '2026-02-23 02:26:56'),
(8, '2026-02-23', '09:44:00', NULL, 'terlambat', NULL, '2026-02-23 02:44:28');

-- --------------------------------------------------------

--
-- Table structure for table `config`
--

CREATE TABLE `config` (
  `nama_perusahaan` varchar(100) DEFAULT NULL,
  `alamat_perusahaan` longtext,
  `no_telp_perusahaan` varchar(20) DEFAULT NULL,
  `email_perusahaan` varchar(100) DEFAULT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_pulang` time DEFAULT NULL,
  `toleransi_telat` int DEFAULT NULL,
  `tunjangan_makan` int DEFAULT '0',
  `tunjangan_transport` int DEFAULT '0',
  `potongan_alpha` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `config`
--

INSERT INTO `config` (`nama_perusahaan`, `alamat_perusahaan`, `no_telp_perusahaan`, `email_perusahaan`, `jam_masuk`, `jam_pulang`, `toleransi_telat`, `tunjangan_makan`, `tunjangan_transport`, `potongan_alpha`) VALUES
('DNA Jaya Group', 'taman dhika', '+6212345678900', 'dnajayagroup@dnajayagroup.co.id', '08:00:00', '17:00:00', 15, 20000, 15000, 100000);

-- --------------------------------------------------------

--
-- Table structure for table `gaji`
--

CREATE TABLE `gaji` (
  `id` int NOT NULL,
  `karyawan_id` int NOT NULL,
  `bulan` int NOT NULL,
  `tahun` int NOT NULL,
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_tunjangan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_potongan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `gaji_bersih` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status_bayar` enum('belum_dibayar','sudah_dibayar') NOT NULL DEFAULT 'belum_dibayar',
  `tanggal_bayar` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gaji`
--

INSERT INTO `gaji` (`id`, `karyawan_id`, `bulan`, `tahun`, `gaji_pokok`, `total_tunjangan`, `total_potongan`, `gaji_bersih`, `status_bayar`, `tanggal_bayar`, `created_at`) VALUES
(14, 2, 2, 2026, 5000000.00, 70000.00, 0.00, 5070000.00, 'belum_dibayar', NULL, '2026-02-23 02:51:02'),
(15, 8, 2, 2026, 500000.00, 35000.00, 30000.00, 505000.00, 'belum_dibayar', NULL, '2026-02-23 02:51:02');

-- --------------------------------------------------------

--
-- Table structure for table `izin`
--

CREATE TABLE `izin` (
  `id` int NOT NULL,
  `karyawan_id` int NOT NULL,
  `jenis_izin` enum('izin','sakit','cuti') NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `keterangan` text,
  `bukti` text,
  `status` enum('pending','disetujui','ditolak') NOT NULL DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `izin`
--

INSERT INTO `izin` (`id`, `karyawan_id`, `jenis_izin`, `tanggal_mulai`, `tanggal_selesai`, `keterangan`, `bukti`, `status`, `approved_by`, `created_at`) VALUES
(1, 2, 'izin', '2026-02-20', '2026-02-22', 'Pengen tidur', 'https://res.cloudinary.com/dnajayagroup/image/upload/v1771567611/web_absensi/izin/e9fhuujhh50msskzzcyn.jpg', 'disetujui', 1, '2026-02-20 06:06:51');

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `id` int NOT NULL,
  `nama` varchar(120) NOT NULL,
  `jabatan` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'karyawan',
  `devisi` enum('default','DNA','RT') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('default','pegawai_tetap','pegawai_sementara') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `profile_picture` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `acc_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NIK` bigint NOT NULL,
  `tempat_lahir` varchar(80) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kel` enum('default','laki_laki','perempuan') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `agama` enum('default','islam','hindu','budha','katolik','konghucu','kristen') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `alamat` longtext,
  `email` varchar(100) DEFAULT NULL,
  `no_telp` varchar(25) DEFAULT NULL,
  `gaji_pokok` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `karyawan`
--

INSERT INTO `karyawan` (`id`, `nama`, `jabatan`, `devisi`, `status`, `profile_picture`, `acc_created`, `NIK`, `tempat_lahir`, `tanggal_lahir`, `jenis_kel`, `agama`, `alamat`, `email`, `no_telp`, `gaji_pokok`) VALUES
(1, 'admin', 'superadmin', 'default', 'default', 'https://s3.getstickerpack.com/storage/uploads/sticker-pack/wielino-pack-01/sticker_20.png?d234a22dce20ea9317b0ba8c556b98e0&d=200x200', '2026-01-22 10:35:21', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(2, 'M Iqbal Ramadhan Al Faris', 'bendahara', 'DNA', 'pegawai_tetap', 'https://res.cloudinary.com/dnajayagroup/image/upload/v1771570751/web_absensi/profile/qdgxysv9tiswvjxmjjp2.jpg', '2020-01-22 10:35:21', 327106301002000, 'Surabaya', '2008-02-23', 'laki_laki', 'islam', 'deket yudhis, lebo', 'farisikbal304@gmail.com', '0812345678900', 5000000),
(8, 'akunbaru', 'karyawan', 'RT', 'pegawai_sementara', 'https://images-porsche.imgix.net/-/media/6B40E90F01E74657A4F4827FC7A7959F_E6F748D71779489DA12FBF73E9002145_CZ25W18OX0002-911-gt3-white-rear?w=1496&h=1986&q=45&crop=faces%2Centropy%2Cedges&auto=format', '2026-02-02 08:56:24', 0, 'September', '2002-02-19', 'perempuan', 'budha', 'deket iqbal', 'kurtau@ychproject.my.id', '087886820365', 500000);

-- --------------------------------------------------------

--
-- Table structure for table `potongan_gaji`
--

CREATE TABLE `potongan_gaji` (
  `id` int NOT NULL,
  `gaji_id` int NOT NULL,
  `jenis_potongan` varchar(100) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL DEFAULT '0.00',
  `keterangan` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `potongan_gaji`
--

INSERT INTO `potongan_gaji` (`id`, `gaji_id`, `jenis_potongan`, `jumlah`, `keterangan`) VALUES
(28, 64, 'Potongan Terlambat', 75000.00, '2 kali terlambat'),
(29, 65, 'Potongan Terlambat', 45000.00, '2 kali terlambat'),
(45, 27, 'Potongan Terlambat', 45000.00, '2 kali terlambat'),
(47, 29, 'Potongan Alpha', 100000.00, '1 hari alpha'),
(49, 15, 'Potongan Terlambat', 30000.00, '1 kali terlambat');

-- --------------------------------------------------------

--
-- Table structure for table `tunjangan`
--

CREATE TABLE `tunjangan` (
  `id` int NOT NULL,
  `gaji_id` int NOT NULL,
  `jenis_tunjangan` varchar(100) NOT NULL,
  `jumlah` decimal(15,2) NOT NULL DEFAULT '0.00',
  `keterangan` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tunjangan`
--

INSERT INTO `tunjangan` (`id`, `gaji_id`, `jenis_tunjangan`, `jumlah`, `keterangan`) VALUES
(9, 64, 'Tunjangan Makan', 140000.00, '7 hari kerja'),
(10, 64, 'Tunjangan Transport', 105000.00, '7 hari kerja'),
(11, 65, 'Tunjangan Makan', 100000.00, '5 hari kerja'),
(12, 65, 'Tunjangan Transport', 75000.00, '5 hari kerja'),
(33, 27, 'Tunjangan Makan', 100000.00, '5 hari kerja'),
(34, 27, 'Tunjangan Transport', 75000.00, '5 hari kerja'),
(47, 14, 'Tunjangan Makan', 40000.00, '2 hari kerja'),
(48, 14, 'Tunjangan Transport', 30000.00, '2 hari kerja'),
(49, 15, 'Tunjangan Makan', 20000.00, '1 hari kerja'),
(50, 15, 'Tunjangan Transport', 15000.00, '1 hari kerja');

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
(2, 'iqbalbal', '$2b$12$jKo6LpIOotnookyksvGr2OMtEpFxhQSwimntAMyaJJsoqk10meInm', 'pegawai'),
(8, 'akunbaru', '$2b$12$bb077vMpgF.8keic5s/87uZjicZDyuq9dkmzThGgDSKaY2c3IMA3u', 'pegawai');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`,`tanggal`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `gaji`
--
ALTER TABLE `gaji`
  ADD PRIMARY KEY (`id`),
  ADD KEY `karyawan_id` (`karyawan_id`),
  ADD KEY `idx_bulan_tahun` (`bulan`,`tahun`),
  ADD KEY `idx_status_bayar` (`status_bayar`);

--
-- Indexes for table `izin`
--
ALTER TABLE `izin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `karyawan_id` (`karyawan_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD UNIQUE KEY `dupli` (`id`);

--
-- Indexes for table `potongan_gaji`
--
ALTER TABLE `potongan_gaji`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gaji_id` (`gaji_id`);

--
-- Indexes for table `tunjangan`
--
ALTER TABLE `tunjangan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gaji_id` (`gaji_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `gaji`
--
ALTER TABLE `gaji`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `izin`
--
ALTER TABLE `izin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `potongan_gaji`
--
ALTER TABLE `potongan_gaji`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `tunjangan`
--
ALTER TABLE `tunjangan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_karyawan` FOREIGN KEY (`id`) REFERENCES `karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `gaji`
--
ALTER TABLE `gaji`
  ADD CONSTRAINT `gaji_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `izin`
--
ALTER TABLE `izin`
  ADD CONSTRAINT `izin_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `izin_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD CONSTRAINT `idkaryawan` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `potongan_gaji`
--
ALTER TABLE `potongan_gaji`
  ADD CONSTRAINT `potongan_gaji_gaji` FOREIGN KEY (`gaji_id`) REFERENCES `gaji` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tunjangan`
--
ALTER TABLE `tunjangan`
  ADD CONSTRAINT `tunjangan_gaji` FOREIGN KEY (`gaji_id`) REFERENCES `gaji` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
