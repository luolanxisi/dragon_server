


CREATE TABLE `tbl_platform` (
  `id` bigint unsigned,
  `pid` int(11) not null,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pid` (`pid`)
) ENGINE=innodb DEFAULT CHARSET=utf8 COMMENT='平台账号对应角色';

CREATE TABLE `tbl_player` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(64) NOT NULL,
  `gold` int(11) not null DEFAULT 0 COMMENT '金币',
  `gem` int(11) not null DEFAULT 0 COMMENT '钻石',
  `wood` int(11) not null DEFAULT 0 COMMENT '木材',
  `stone` int(11) not null DEFAULT 0 COMMENT '石料',
  `iron` int(11) not null DEFAULT 0 COMMENT '铁矿',
  `food` int(11) not null DEFAULT 0 COMMENT '粮草',
  `lastHarvest` int(11) not null DEFAULT 0 COMMENT '最后计算收入时间',
  `repute` int(11) not null DEFAULT 0 COMMENT '声望',
  `skillExp` int(11) not null DEFAULT 0 COMMENT '技能经验',
  `leagueId` int(11) not null DEFAULT 0 COMMENT '联盟id',
  `regTime` int(11) not null COMMENT '注册时间',
  `lastLogin` int(11) not null COMMENT '最后登录时间',
  `landData` text,
  `heroData` text,
  `skillData` text,
  `castleData` text,
  `taskData` text,
  PRIMARY KEY (`id`)
) ENGINE=innodb DEFAULT CHARSET=utf8 COMMENT='角色信息表';


