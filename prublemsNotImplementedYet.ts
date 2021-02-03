//TODO not adding transaction for none of the systems
//TODO checking that if some thing gets saved and it does not publish an event
//TODO to check if the event has been published i can add a sort of collection and when ever i try to
//to publish i save it and put a published no and when it gets published i set it to yes and some how
// check it as well

//TODO have not yet developed a signUp system with email and all those shitty stuff

//TODO upon emitting delete of solution and also others send version as well and check that a concurrency
// issue does not pop up

//TODO what happens if you create a user and it does not recieve or publish the event for it
//TODO maybe the better approach would be to do not care about the user and only care about the users that are disabled or add a sort of error to inform the user that maybe they should come later
//TODO write a test for many user creating user and check to see how many of them see the problem that they account is not accepted because the event of sign up has not yet recieved