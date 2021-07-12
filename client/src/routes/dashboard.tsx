import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Components from "../components/Components";
import Client from "../api/Client";
import { socket } from "../config/socket";
import { ChangeE } from "../models/Events";
import { Room } from "../models/Room";
import { useAuth } from "../contexts/authContext";
import {
	Container,
	Paper,
	Button,
	Typography,
	Divider,
	TextField,
	makeStyles,
} from "@material-ui/core";

const { Nav, Search } = Components;

const useStyles = makeStyles(theme => ({
	main: {
		// height: "100vh",
		// width: "100vw",
	},
	container: {
		height: "100vh",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	paper: {
		padding: theme.spacing(2),
		textAlign: "center",
	},
	newRoom: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},
	newRoomBtn: {
		marginTop: theme.spacing(2),
		fontSize: "18px",
	},
}));

interface Props {}

const Dashboard: React.FC<Props> = ({}) => {
	const classes = useStyles();
	const history = useHistory();
	const { authState } = useAuth();

	const [rooms, setRooms] = useState([]);
	const [roomName, setRoomName] = useState("");
	const [roomNameError, setRoomNameError] = useState("");

	useEffect(() => {
		Client.rooms.findAllExcluding(authState.user.username).then(rooms => {
			console.log(rooms);
			setRooms(rooms);
		});
	}, []);

	const handleNewRoomName = (e: ChangeE) => {
		const { value } = e.target;
		setRoomName(value);
	};

	const validateRoomName = () => {
		const temp =
			roomName.length < 21 ? "" : "Room Name cannot exceed 22 characters";
		setRoomNameError(temp);
		return temp === "";
	};

	const getRoomRouteInfo = (room: Room) => {
		const roomNameSlug = roomName.toLowerCase().split(" ").join("-");
		return {
			pathname: `/rooms/${roomNameSlug}`,
			state: { roomId: room.id },
		};
	};

	const createNewRoom = () => {
		const info = {
			name: roomName,
			admin: authState.user.username,
		};

		// Verify if room name is unique and then redirect to the room route
		if (validateRoomName()) {
			socket.emit("new-room", info);

			socket.on("new-room-error", (error: string) => {
				setRoomNameError(error);
			});

			socket.on("new-room", (room: Room) => {
				history.push(getRoomRouteInfo(room));
			});
		}
	};

	return (
		<main className={classes.main}>
			<Nav />
			<Container className={classes.container}>
				<Paper className={classes.paper} elevation={12}>
					<div className={classes.newRoom}>
						<Typography variant="h4" gutterBottom>
							Create a new room
						</Typography>
						<TextField
							label="Provide a room name..."
							color="secondary"
							value={roomName}
							onChange={handleNewRoomName}
							error={roomNameError ? true : false}
							helperText={roomNameError}
						/>
						<Button
							className={classes.newRoomBtn}
							variant="contained"
							color="primary"
							size="large"
							onClick={createNewRoom}
						>
							Create Room
						</Button>
					</div>
					<Divider style={{ margin: "2rem 0" }} />
					<div>
						<Typography variant="h4" style={{ marginBottom: "1rem" }}>
							Search for an existing room
						</Typography>
						<Search />
					</div>
				</Paper>
			</Container>
		</main>
	);
};

export default Dashboard;
