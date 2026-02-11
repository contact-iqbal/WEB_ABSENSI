-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 11, 2026 at 01:17 AM
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
(2, '2026-02-02', '08:35:00', '08:36:00', 'hadir', NULL, '2026-02-02 01:35:24'),
(8, '2026-02-02', '08:56:00', '13:06:00', 'hadir', NULL, '2026-02-02 01:56:47'),
(8, '2026-02-05', '16:25:00', NULL, 'hadir', NULL, '2026-02-05 09:25:07');

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
(1, 2, 2, 2026, 0.00, 0.00, 0.00, 0.00, 'sudah_dibayar', '2026-02-02', '2026-02-02 01:49:01'),
(3, 8, 2, 2026, 0.00, 0.00, 0.00, 0.00, 'belum_dibayar', NULL, '2026-02-02 01:59:09');

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
(8, 'akunbaru', 'karyawan', 'default', 'default', NULL, '2026-02-02 01:56:24', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0);

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
(2, 'iqbalbal', '$2b$12$BPbm3aUGKKGgWLbu4/o.Buvw8SGV1cbS.qGfaW4U9wfwQRnDz4ln.', 'pegawai'),
(5, 'iqbal', '$2b$12$U7w/G46dZFlDWJ/jsK4ZuONYGug6E4zH5BsdqTNpEMFb/UXCizBnC', 'pegawai'),
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `izin`
--
ALTER TABLE `izin`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `potongan_gaji`
--
ALTER TABLE `potongan_gaji`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tunjangan`
--
ALTER TABLE `tunjangan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
