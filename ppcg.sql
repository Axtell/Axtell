CREATE DATABASE  IF NOT EXISTS `ppcg` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `ppcg`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: ppcg
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `answer_view`
--

DROP TABLE IF EXISTS `answer_view`;
/*!50001 DROP VIEW IF EXISTS `answer_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `answer_view` AS SELECT
 1 AS `id`,
 1 AS `post_id`,
 1 AS `code`,
 1 AS `commentary`,
 1 AS `user_id`,
 1 AS `user`,
 1 AS `post_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `answer_votes`
--

DROP TABLE IF EXISTS `answer_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answer_votes` (
  `post_id` int(10) unsigned NOT NULL,
  `user_id` int(11) NOT NULL,
  `vote` tinyint(3) NOT NULL DEFAULT '0',
  `vote_time` datetime NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  UNIQUE KEY `post_id_UNIQUE` (`post_id`),
  KEY `answer_vote_user_id_idx` (`user_id`),
  CONSTRAINT `answer_vote_post_id` FOREIGN KEY (`post_id`) REFERENCES `answers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `answer_vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Votes on answers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int(10) NOT NULL,
  `code` longtext,
  `commentary` longtext,
  `user_id` int(10) NOT NULL,
  `post_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `answer_post_id` FOREIGN KEY (`id`) REFERENCES `posts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `answer_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Answers to posts';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_tags` (
  `post_id` int(10) unsigned NOT NULL COMMENT 'Post ID for parent post',
  `post_tag_id` int(10) unsigned NOT NULL COMMENT 'The index of the tag on the post',
  `post_tag` int(11) NOT NULL COMMENT 'The specific tag',
  PRIMARY KEY (`post_id`,`post_tag_id`,`post_tag`),
  KEY `post_tag_idx` (`post_tag`),
  CONSTRAINT `post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `post_tag` FOREIGN KEY (`post_tag`) REFERENCES `tags` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Tags for given post';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `post_tags_view`
--

DROP TABLE IF EXISTS `post_tags_view`;
/*!50001 DROP VIEW IF EXISTS `post_tags_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `post_tags_view` AS SELECT
 1 AS `post_id`,
 1 AS `post_tag_id`,
 1 AS `post_tag`,
 1 AS `tag_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `post_view`
--

DROP TABLE IF EXISTS `post_view`;
/*!50001 DROP VIEW IF EXISTS `post_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `post_view` AS SELECT
 1 AS `id`,
 1 AS `title`,
 1 AS `content`,
 1 AS `user_id`,
 1 AS `user`,
 1 AS `post_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `post_votes`
--

DROP TABLE IF EXISTS `post_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_votes` (
  `post_id` int(10) unsigned NOT NULL,
  `user_id` int(11) NOT NULL,
  `vote` tinyint(3) DEFAULT '0',
  `vote_time` datetime NOT NULL,
  PRIMARY KEY (`post_id`,`user_id`),
  UNIQUE KEY `post_id_UNIQUE` (`post_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  CONSTRAINT `vote_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Votes on questions/challenges';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `content` longtext NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `post_user_id_idx` (`user_id`),
  CONSTRAINT `post_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Challenges/questions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Tags for questions/challenges';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `auth_key` varchar(45) NOT NULL,
  `is_mod` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Table for user info';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'ppcg'
--

--
-- Final view structure for view `answer_view`
--

/*!50001 DROP VIEW IF EXISTS `answer_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `answer_view` AS select `answers`.`id` AS `id`,`answers`.`post_id` AS `post_id`,`answers`.`code` AS `code`,`answers`.`commentary` AS `commentary`,`answers`.`user_id` AS `user_id`,(select `users`.`username` from `users` where (`users`.`id` = `answers`.`user_id`)) AS `user`,`answers`.`post_time` AS `post_time` from `answers` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `post_tags_view`
--

/*!50001 DROP VIEW IF EXISTS `post_tags_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `post_tags_view` AS select `post_tags`.`post_id` AS `post_id`,`post_tags`.`post_tag_id` AS `post_tag_id`,`post_tags`.`post_tag` AS `post_tag`,(select `tags`.`name` from `tags` where (`tags`.`id` = `post_tags`.`post_tag`)) AS `tag_name` from `post_tags` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `post_view`
--

/*!50001 DROP VIEW IF EXISTS `post_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `post_view` AS select `posts`.`id` AS `id`,`posts`.`title` AS `title`,`posts`.`content` AS `content`,`posts`.`user_id` AS `user_id`,(select `users`.`username` from `users` where (`users`.`id` = `posts`.`user_id`)) AS `user`,`posts`.`post_time` AS `post_time` from `posts` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-09  6:17:58
