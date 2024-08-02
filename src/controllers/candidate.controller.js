import Candidate from "../models/candidate.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
const checkAdminRole = (user) => user.role === "admin";

const createNewCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, party, age } = req.body;
    if ([name, party, age].some((field) => !field)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCandidate = new Candidate({
      name,
      party,
      age,
    });

    const response = await newCandidate.save();

    res.status(200).json({
      message: "Candidate Created Successfully",
      response: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updatedCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const candidateID = req.params.candidateID;

    // check id empty candidateID
    if (!candidateID) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // check mongoose object id is valid
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ message: "Invalid Candidate ID" });
    }

    const { name, party, age } = req.body;
    if ([name, party, age].some((field) => !field)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      {
        name,
        party,
        age,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // check if not response
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // send proper res.
    res.status(200).json({
      message: "condidate data updated",
      response: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    if (!checkAdminRole(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const candidateID = req.params.candidateID;

    // check id empty candidateID
    if (!candidateID) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // check mongoose object id is valid
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ message: "Invalid Candidate ID" });
    }

    // delete by candiateID
    const response = await Candidate.findByIdAndDelete(candidateID);

    // check candidatefind and delete
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // send res
    res.status(200).json({
      message: "condidate deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const vote = async (req, res) => {
  try {
    //------------------- get user ------------------//
    const userID = req.user._id;
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (checkAdminRole(user)) {
      return res.status(403).json({ message: "Admin is not allowed to vote" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // ---------------------- get candidate -----------------//
    const candidateID = req.params.candidateID;

    // check id empty candidateID
    if (!candidateID) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    // check mongoose object id is valid
    if (!mongoose.Types.ObjectId.isValid(candidateID)) {
      return res.status(400).json({ message: "Invalid Candidate ID" });
    }

    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // upadate the Candidate document to record the vote
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    // update the user document
    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your vote" });
  }
};

export { createNewCandidate, updatedCandidate, deleteCandidate, vote };
