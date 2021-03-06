import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Loading } from "../Login/Loading";
import { NotFound } from "../NotFound";
import { UserContext, UserData } from "../../utils/hooks/UserContext";
import { ProjectMember, } from "./ProjectMember";
import { ListCard, } from "./ListCard";
import { CreateCardModal } from "./CreateCardModal";
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { ListDelDialog } from "./ListDelDialog";
import axios from "axios";
import DOMPurify from "dompurify";
import { useHistory } from "react-router-dom";
import {
    Container,
    Box,
    Typography,
    useMediaQuery,
    AccordionSummary,
    Stack,
    Button,
    TextField,
    Card,
    IconButton,
    useTheme
} from "@mui/material";
import { LoadingButton } from '@mui/lab';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { makeStyles, styled } from "@mui/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsIcon from '@mui/icons-material/Settings';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

export const ProjectDetail = () => {
    const { user } = useContext(UserContext);
    const { userData } = useContext(UserData);
    const { projectId } = useParams();
    let history = useHistory();

    const [pageLoading, setPageLoading] = useState(true);
    const [notfound, setNotfound] = useState(false);
    const [project, setProject] = useState({});

    //States for list.
    const [addingNewList, setAddingNewList] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newListError, setNewListError] = useState(false);
    const [listRequestLoading, setListRequestLoading] = useState(false);
    const [listPostError, setListPostError] = useState(false);

    const [listDel, setListDel] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    //States for card creation
    const [addingNewCard, setAddingNewCard] = useState(false);
    const [modalListId, setModalListId] = useState(-1);
    const [getNewCard, setGetNewCard] = useState(false);
    const [cardDel, setCardDel] = useState(false);

    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        async function getProjectData() {
            return await axios
                .get("/project/" + projectId + "/", {
                    headers: JSON.parse(user),
                })
                .then((res) => {
                    if (res.status === 200) {
                        setProject(res.data);
                        setNotfound(false);
                        setPageLoading(false);
                    } else {
                        setNotfound(true);
                        setPageLoading(false);
                    }
                })
                .catch((err) => {
                    setNotfound(true);
                    setPageLoading(false);
                });
        }
        getProjectData();
    }, [user, projectId, listRequestLoading, getNewCard, listDel, cardDel]);

    const addNewList = () => {
        setAddingNewList(true);
    }

    const closeAddNewList = () => {
        setNewListError(false);
        setAddingNewList(false);    
    }

    const handleNewListTitle = (e) => {
        setNewListError(false);
        setNewListTitle(e.target.value);
    }

    const saveNewList = async() => {
        if(newListTitle.trim() === ""){
            setNewListError(true);
        }
        else{
            setListRequestLoading(true);
            const data = {
                title: newListTitle.trim(),
            }
            return await axios
            .post('/project/'+projectId+'/list/', data, { headers: JSON.parse(user), })
            .then((res) => {
                if(res.status === 201){
                    setNewListTitle("");
                    setNewListError(false);
                    setListPostError(false);
                    setListRequestLoading(false);
                    setAddingNewList(false);    
                }
                else {
                    setListRequestLoading(false);
                    setListPostError(true);
                }
            })
            .catch((err) => {
                console.log(err);
                setListPostError(true);
                setListRequestLoading(false);
            });
        }
    }

    const dialogClose = () => {
        setDialogOpen(false);
    }

    const deleteList = async(listId) => {
        return await axios
        .delete(`project/${projectId}/list/${listId}/`, { headers: JSON.parse(user), })
        .then((res) => {
            setListDel(null);
            setDialogOpen(false);
        })
        .catch((err) => {
            console.log(err);
            setDialogOpen(false);
        })
    }

    const addNewCard = (listId) => {
        setAddingNewCard(true);
        setModalListId(listId);
    }

    const closeAddNewCard = () => {
        setAddingNewCard(false);
    }

    const fetchNewCard = () => {
        setGetNewCard(!getNewCard);
    }
    const afterCardDel = () => {
        setCardDel(!cardDel);
    }

    const useStyles = makeStyles({
        scrollBar: {
            "&::-webkit-scrollbar": {
                width: "7px",
                height: "7px",
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.main,
            },
        },  
    });

    const myStyles = useStyles();

    const Accordion = styled((props) => (
        <MuiAccordion elevation={0}  {...props} />
      ))(({ theme }) => ({
        border: `0px`,
        '&:not(:last-child)': {
          borderBottom: 0,
        },
        borderRadius: 10,
        '&:before': {
          display: 'none',
        },
        '&:first-child': {
            borderRadius: 10,
        },
        '&:last-child': {
            borderRadius: 10,
        },
        margin: '7px',
    }));
      
    const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.text.disabled}`,
    }));
      

    if (notfound) {
        return <NotFound />;
    }

    if (pageLoading) {
        return <Loading />;
    } else {
        return (
            <Container
                sx={{
                    mt: 3,
                    maxWidth: "90vw",
                    paddingRight: isPhone ? 3.5 : "auto",
                    minWidth: isPhone ? "100vw" : "inherit",
                }}
            >
                <ListDelDialog 
                    dialogOpen={dialogOpen} 
                    dialogClose={dialogClose}
                    deleteList={() =>  deleteList(listDel)} 
                />
                <CreateCardModal 
                    open={addingNewCard} 
                    close={closeAddNewCard} 
                    projectId={project.id} 
                    listId={modalListId} 
                    members={project.members}
                    updateDOM={fetchNewCard}
                />

                <Box>
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            flexWrap: 'wrap', 
                        }}
                    >
                        <Typography variant="h2" color="text.primary">
                            {project.name}
                        </Typography>
                        {(userData.user_type === "admin" || userData.user_id === project.creator.user_id) &&
                        <Box>
                            <Button 
                                disabled={userData.is_disabled}
                                size="large" 
                                endIcon={<SettingsIcon />} 
                                sx={{ textTransform: 'none', }}
                                onClick={() => {
                                    history.push(`/project/${projectId}/edit`)
                                }}
                            >
                                Edit
                            </Button>
                        </Box>
                        }   
                    </Box>
                    <Typography variant="h6" color="text.secondary">
                        Leader: {project.creator.full_name}
                    </Typography>   
                </Box>
                <div
                    className={myStyles.scrollBar}
                    style={{
                        backgroundColor: '#fafafa',
                        borderRadius: "10px",
                        overflow: "auto",
                        padding: "10px",
                        maxWidth: "95vw",
                        maxHeight: "90vh",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(project.wiki),
                    }}
                ></div>
                <Box sx={{ mt: 5, mb: 5 }}>
                    <Typography color="text.primary" variant="h4">Project members</Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 5,
                        }}
                    >
                        {project.members.map((member, idx) => {
                                  return (
                                      <ProjectMember
                                          key={idx}
                                          avatar={member.display_picture}
                                          fullName={member.full_name}
                                          enrolmentNumber={
                                              member.enrolment_number
                                          }
                                          userType={member.user_type}
                                          isDisabled={member.is_disabled}
                                      />
                                  );
                              })}
                    </Box>
                </Box>

                <Box sx={{ mt: 5, mb: 5 }}>
                    <Typography color="text.primary" variant="h4">Lists</Typography>
                    <Box>
                        {project.list_set.map((list, idx) => {
                            return (
                                <Accordion
                                    key={idx}
                                    sx={{
                                        boxShadow: "none",
                                        border: "1px solid #b8b8b8",
                                    }}
                                    TransitionProps={{ unmountOnExit: true }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', }}>
                                            <Typography color="text.primary">{list.title}</Typography>
                                            <Box>
                                                {(list.creator === userData.user_id || userData.user_type==="admin" || project.creator.user_id === userData.user_id) &&
                                                <IconButton 
                                                    disabled={userData.is_disabled}
                                                    size="large"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        history.push(`/project/${project.id}/${list.id}/edit`);
                                                    }}
                                                >
                                                    <BorderColorIcon />
                                                </IconButton>
                                                }
                                                {(list.creator === userData.user_id || userData.user_type==="admin" || project.creator.user_id === userData.user_id) &&
                                                <IconButton 
                                                    disabled={userData.is_disabled}
                                                    size="large"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setListDel(list.id);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <DeleteSweepIcon />
                                                </IconButton>
                                                }
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack
                                            spacing={2}
                                            overflow={false}
                                            direction="row"
                                            className={myStyles.scrollBar}
                                            sx={{ 
                                                overflowX: "auto",
                                                height: "fit-content",
                                                p: 1,
                                                maxHeight: 220,
                                            }}
                                            alignItems="flex-start"
                                        >
                                            
                                                <Card
                                                    variant="outlined"
                                                    sx={{
                                                        backgroundColor: theme.palette.background.default,
                                                        borderRadius: 5,
                                                        width: 250,
                                                        minWidth: 250,
                                                        height: 200,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Button 
                                                        disabled={userData.is_disabled}
                                                        endIcon={<AddBoxIcon />} 
                                                        sx={{ fontSize: 18, }}
                                                        onClick={() => addNewCard(list.id)}
                                                    >
                                                        New card
                                                    </Button>
                                                </Card>
                                            
                                            {
                                                list.card_set.map((card, index) => {
                                                    return (
                                                        <ListCard 
                                                            key={index}
                                                            project={project}
                                                            listId={list.id}
                                                            cardId={card.id}
                                                            title={card.title} 
                                                            creator={
                                                                project.members.find((member) => {
                                                                    return member.user_id === card.creator.user_id
                                                                })
                                                            } 
                                                            desc={card.desc}
                                                            dueDate={card.due_date} 
                                                            finishedStatus={card.finished_status} 
                                                            cardDel={afterCardDel}
                                                        />
                                                    )
                                                })
                                            }
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 2, m: '7px', p: 1, }} >
                            {!addingNewList ?
                            <Box>
                                <Box sx={{ cursor: 'default', width: '100%', height: '100%', textAlign: 'center',}}>
                                    <Button     
                                        disabled={userData.is_disabled}
                                        endIcon={<PlaylistAddIcon />}
                                        onClick={addNewList}
                                    >
                                        Add a new list
                                    </Button>
                                </Box>
                            </Box>
                            :
                            <Box sx={{ p: 2, }}>
                                <Box 
                                    sx={{   
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-evenly', 
                                        flexWrap: 'wrap', 
                                        margin: 'auto', 
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                        <TextField 
                                            autoComplete="off"
                                            error={newListError || listPostError}
                                            label={newListError ? "Invalid list title" : (listPostError ? "Some error occurred." : "List title")} 
                                            helperText={listPostError && "You might be disabled"}
                                            sx={{ width: '100%', }} 
                                            value={newListTitle} 
                                            onChange={handleNewListTitle}
                                        />
                                        <LoadingButton 
                                            loading={listRequestLoading}
                                            color="success" 
                                            variant="contained" 
                                            sx={{ m: 2, boxShadow: 'none', }} 
                                            onClick={saveNewList} 
                                        >
                                            SAVE
                                        </LoadingButton>
                                    </Box>
                                    <LoadingButton 
                                        loading={listRequestLoading}
                                        color="error" 
                                        onClick={closeAddNewList}
                                    >
                                        Close
                                    </LoadingButton>
                                </Box>
                            </Box>
                            }   
                        </Box>
                    </Box>
                </Box>
            </Container>
        );
    }
};

