import React, { useState, useEffect, useRef } from "react";
import supabase from "../Supabase/client";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());
  const [callId, setCallId] = useState(0);

  const [remoteId, setRemoteId] = useState();

  const webcamVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    startWebcam();
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      webcamVideoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const handleCall = async () => {
    const { data, error } = await supabase
      .from("calls")
      .insert({ offer: {}, answer: {} })
      .select("id");

    setCallId(data[0].id);
    setRemoteId(null);

    var list = [];
    pc.onicecandidate = async (event) => {
      if (event.candidate === null) return;
      list.push(event.candidate.toJSON());
      await supabase
        .from("calls")
        .update({ offerCandidates: list })
        .eq("id", data[0].id);
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    console.log(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    const res = await supabase
      .from("calls")
      .update({ offer })
      .eq("id", data[0].id);

    const answerChannel = supabase
      .channel("answerChannel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          condition: (event, table, row) => {
            return row.id === data[0].id;
          },
        },
        (payload) => {
          console.log("payload");
          console.log(payload);
          const answerCandidates = payload.new?.answerCandidates;
          if (answerCandidates.length !== 0) {
            answerCandidates.forEach((candidate) => {
              if (candidate === null && pc.remoteDescription != null) return;
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            });
          }
          const answerDescription = payload.new?.answer;
          if (answerDescription) {
            console.log("answerDescription");
            console.log(answerDescription);
            pc.setRemoteDescription(
              new RTCSessionDescription(answerDescription)
            );
          }
        }
      )
      .subscribe();
  };

  const handleAnswer = async () => {
    var list = [];
    pc.onicecandidate = async (event) => {
      if (event.candidate === null) return;
      list.push(event.candidate.toJSON());
      console.log(list);
      const data = await supabase
        .from("calls")
        .update({ answerCandidates: list })
        .eq("id", BigInt(remoteId));
      console.log(data);
    };
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .eq("id", BigInt(remoteId));
    console.log(data[0]);
    const offerDescription = data[0].offer;
    console.log("offerDescription");
    console.log(offerDescription);
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await supabase.from("calls").update({ answer }).eq("id", BigInt(remoteId));

    const offerCandidates = data[0].offerCandidates;
    console.log("offerCandidates");
    console.log(offerCandidates);

    const responseChannel = supabase
      .channel("responseChannel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          condition: (event, table, row) => {
            return row.id === BigInt(remoteId);
          },
        },
        (payload) => {
          const offerCandidates = payload.new?.offerCandidates;
          offerCandidates.forEach((candidate) => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
        }
      )
      .subscribe();
  };

  useEffect(() => {
    if (localStream) {
      webcamVideoRef.current.srcObject = localStream;
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const handelInput = (e) => {
    setCallId(null);
    console.log(e.target.value);
    setRemoteId(e.target.value);
  };

  return (
    <div>
      <video ref={webcamVideoRef} autoPlay playsInline muted />
      <video ref={remoteVideoRef} autoPlay playsInline />
      <button onClick={handleCall} disabled={!localStream}>
        Call
      </button>
      <p>{callId != "" ? callId : "wait"}</p>
      <input placeholder="val" onChange={handelInput} type="number" />
      <button onClick={handleAnswer}>Answer</button>
    </div>
  );
};

export default VideoCall;
