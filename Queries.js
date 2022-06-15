// create database bankapp_sql

// CREATE TABLE Persons (
//     Id varchar(50) PRIMARY KEY,
//     Name varchar(50) NOT NULL,
//     Email varchar(50) NOT NULL,
//     Password varchar(200) NOT NULL,
//     Tokens varchar(755)
// );


// CREATE TABLE Bank (
//     Accno varchar(50) ,
//     Amount int NOT NULL,
//     Pin varchar(50) NOT NULL,
//     Owner varchar(50)
// );

// CREATE TABLE Transactions(
//     TransactionType varchar(50)  ,
//      TransactionAmount int NULL,
// 	 Time varchar(50) ,
//       Owner varchar(50)
// );

//register user---

// CREATE or alter procedure [dbo].[Register_Bank_user]  
// (  

// @Id varchar(50),
// @Name varchar(50),  
// @Email varchar(50),   
// @Password varchar(200),
// @Accno  varchar(50),
// @Amount int,
// @Pin varchar(50),
// @Owner varchar(50)
 
// )

// AS  
// BEGIN 
// insert into Persons(Id,Name,Email,Password) values( @Id, @Name, @Email, @Password)
// insert into Bank(Accno,Amount,Pin,Owner) values( @Accno, @Amount, @Pin, @Owner)

// END

// transaction history in  transfer amount route

// CREATE or alter procedure [dbo].[Transaction_history]  
// (  
// @senderTransactionType varchar(50),
// @senderTransactionAmount int,  
// @senderTime varchar(50),   
// @Sender varchar(200),
// @ReceiverTransactionType  varchar(50),
// @ReceiverTransactionAmount int,
// @ReceiverTime varchar(50),
// @Receiver varchar(50)
// )
// AS  
// BEGIN 
// insert into Transactions (TransactionType,TransactionAmount,Time,Owner) values( @senderTransactionType, @senderTransactionAmount, @senderTime,@Sender)
// insert into Transactions (TransactionType,TransactionAmount,Time,Owner) values(@ReceiverTransactionType , @ReceiverTransactionAmount,@ReceiverTime, @Receiver)

// END