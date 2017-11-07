CREATE DATABASE IF NOT EXISTS `ppcg` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `ppcg`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: ppcg
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE = @@TIME_ZONE */;
/*!40103 SET TIME_ZONE = '+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;
/*!40101 SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES = @@SQL_NOTES, SQL_NOTES = 0 */;

--
-- Table structure for table `answer_votes`
--

DROP TABLE IF EXISTS `answer_votes`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answer_votes` (
  `post_id`   INT(10) UNSIGNED NOT NULL,
  `user_id`   INT(11)          NOT NULL,
  `vote`      TINYINT(3)       NOT NULL DEFAULT '0',
  `vote_time` DATETIME         NOT NULL,
  PRIMARY KEY (`post_id`, `user_id`),
  UNIQUE KEY `post_id_UNIQUE` (`post_id`),
  KEY `answer_vote_user_id_idx` (`user_id`),
  CONSTRAINT `answer_vote_post_id` FOREIGN KEY (`post_id`) REFERENCES `answers` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `answer_vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Votes on answers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers` (
  `id`         INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id`    INT(10)          NOT NULL,
  `code`       LONGTEXT,
  `commentary` LONGTEXT,
  `user_id`    INT(10)          NOT NULL,
  `post_time`  DATETIME         NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `answer_post_id` FOREIGN KEY (`id`) REFERENCES `posts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `answer_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Answers to posts';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_votes`
--

DROP TABLE IF EXISTS `post_votes`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_votes` (
  `post_id`   INT(10) UNSIGNED NOT NULL,
  `user_id`   INT(11)          NOT NULL,
  `vote`      TINYINT(3) DEFAULT '0',
  `vote_time` DATETIME         NOT NULL,
  PRIMARY KEY (`post_id`, `user_id`),
  UNIQUE KEY `post_id_UNIQUE` (`post_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  CONSTRAINT `vote_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Votes on questions/challenges';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id`        INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`     VARCHAR(50)      NOT NULL,
  `content`   LONGTEXT         NOT NULL,
  `tag1`      INT(11)          NOT NULL,
  `tag2`      INT(11)                   DEFAULT NULL,
  `tag3`      INT(11)                   DEFAULT NULL,
  `tag4`      INT(11)                   DEFAULT NULL,
  `tag5`      INT(11)                   DEFAULT NULL,
  `user_id`   INT(11)          NOT NULL,
  `post_time` DATETIME         NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tag3_idx` (`tag3`),
  KEY `tag4_idx` (`tag4`),
  KEY `tag5_idx` (`tag5`),
  KEY `post_user_id_idx` (`user_id`),
  KEY `tag1_idx` (`tag1`),
  KEY `tag2_idx` (`tag2`),
  CONSTRAINT `post_tag1` FOREIGN KEY (`tag1`) REFERENCES `tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_tag2` FOREIGN KEY (`tag2`) REFERENCES `tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_tag3` FOREIGN KEY (`tag3`) REFERENCES `tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_tag4` FOREIGN KEY (`tag4`) REFERENCES `tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_tag5` FOREIGN KEY (`tag5`) REFERENCES `tags` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `post_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Challenges/questions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id`   INT(11)     NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Tags for questions/challenges';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id`       INT(11)             NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45)         NOT NULL,
  `auth_key` VARCHAR(45)         NOT NULL,
  `is_mod`   TINYINT(3) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
)
  ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COMMENT ='Table for user info';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE = @OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE = @OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES = @OLD_SQL_NOTES */;

-- Dump completed on 2017-11-05 21:45:33
