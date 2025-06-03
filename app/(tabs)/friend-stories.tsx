import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase/firebase-config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  uid: string;
  username: string;
  profilePicture?: string;
  friends?: string[];
}

interface Story {
  id: string;
  owner: string;
  thumbnail_url: string;
title?: string;
  description?: string;
  story_generated_date?: any;
  ownerDetails?: User;
}

export default function FriendStoriesScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentUser({ uid: user.uid, ...userSnap.data() } as User);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (currentUser) {
        const friendUids = currentUser.friends || [];
        if (friendUids.length > 0) {
          const friendsQuery = query(collection(db, 'users'), where('uid', 'in', friendUids));
          const friendDocs = await getDocs(friendsQuery);
          const friendsList: User[] = [];
          friendDocs.forEach(doc => {
            friendsList.push({ uid: doc.id, ...doc.data() } as User);
          });
          setFriends(friendsList);
        }
      }
    };

    fetchFriends();
  }, [currentUser]);

  useEffect(() => {
    const fetchStories = async () => {
      let storiesQuery;
      if (selectedFriendId) {
        storiesQuery = query(collection(db, 'stories'), where('owner', '==', selectedFriendId));
      } else {
        // Load stories from all friends if no specific friend is selected
        const friendUids = friends.map(friend => friend.uid); // Extract UIDs from friends list
        if (friendUids.length > 0) {
           // Firestore 'in' query has a limit of 10, may need to handle more friends
           // For simplicity now, assuming friends list is small enough or using batches if needed
           storiesQuery = query(collection(db, 'stories'), where('owner', 'in', friendUids.slice(0, 10))); // Limit to first 10 friends for 'in' query limit
        } else {
          setStories([]); // Clear stories if no friends
          return;
        }
      }

      const storyDocs = await getDocs(storiesQuery);
      let storiesList: Story[] = [];
      const ownerUids = new Set<string>();

      storyDocs.forEach(doc => {
        const storyData = doc.data() as Story;
        const { id, ...restOfStoryData } = storyData; // Destructure to exclude 'id'
        storiesList.push({ id: doc.id, ...restOfStoryData }); // Use doc.id and rest of data
        ownerUids.add(restOfStoryData.owner); // Use owner from restOfStoryData
      });

      // Fetch owner details for all unique owners
      if (ownerUids.size > 0) {
         // Firestore 'in' query has a limit of 10, may need to handle more owners
         const ownerUidsArray = Array.from(ownerUids);
         const ownerQuery = query(collection(db, 'users'), where('uid', 'in', ownerUidsArray.slice(0, 10))); // Limit to first 10 owner UIDs
         const ownerDocs = await getDocs(ownerQuery);
         const ownerDetailsMap = new Map<string, User>();
         ownerDocs.forEach(doc => {
            ownerDetailsMap.set(doc.id, { uid: doc.id, ...doc.data() } as User);
         });

         // Attach owner details to stories
         storiesList = storiesList.map(story => ({
            ...story,
            ownerDetails: ownerDetailsMap.get(story.owner),
         }));
      }

      setStories(storiesList);
    };

    fetchStories();
  }, [selectedFriendId, friends]);


  return (
    <SafeAreaView style={styles.container}>
      {/* Friend list and All option */}
      <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.bggradient} />
      <Image
        source={require("../../assets/images/NewUI/Background1.png")}
        style={styles.bgimage}
        resizeMode="cover"
        onError={(error) => console.log("ImageBackground error:", error.nativeEvent.error)}
      />
      <View style={styles.header}>
          <Image source={require("../../assets/images/NewUI/newlogo.png")} style={styles.logoIcon} />
          <View style={styles.searchBar}>
              <Text style={styles.searchText}>search for author, key word...</Text>
              <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 15 }} />
          </View>
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
          <View style={styles.avatar}>
              <Text style={styles.avatarText}>HJ</Text>
          </View>
      </View>
      <ScrollView horizontal style={styles.friendListContainer}>
         {/* Add 'All' option */}
        <TouchableOpacity
          onPress={() => setSelectedFriendId(null)}
          style={[
            styles.friendItem, // Use friendItem style for All option as well
            selectedFriendId === null && styles.selectedFriendItem,
          ]}>
          <Text
            style={[
              styles.friendName,
              selectedFriendId === null && styles.selectedFriendName,
            ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Friend list */}
        {friends.map(friend => (
          <TouchableOpacity
            key={friend.uid}
            onPress={() => setSelectedFriendId(friend.uid)}
            style={[
              styles.friendItem,
            ]}>
             {friend.profilePicture ? (
                <Image
                   source={{ uri: friend.profilePicture }}
                   style={[
                      styles.profilePicture,
                      selectedFriendId === friend.uid && styles.selectedProfilePicture
                   ]}
                />
             ) : (
                <View
                   style={[
                      styles.profilePicturePlaceholder,
                      selectedFriendId === friend.uid && styles.selectedProfilePicture
                   ]}
                />
             )}
            <Text
              style={[
                styles.friendName,
                selectedFriendId === friend.uid && styles.selectedFriendName,
              ]}>
              {friend.username}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Add 'Add more friends' placeholder */}
        <TouchableOpacity style={styles.addFriendPlaceholder}>
          <Text style={styles.addFriendPlusText}>+</Text>
          <Text style={styles.addFriendLabelText}>Add more Friends</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Stories list */}
      <ScrollView style={styles.storiesList}>
        {stories.map(story => (
          <View key={story.id} style={styles.storyItem}>
            <Image source={{ uri: story.thumbnail_url }} style={styles.storyThumbnail} />
            <View style={styles.storyContent}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              {story.description && <Text style={styles.storyDescription}>{story.description}</Text>}
              {story.ownerDetails && (
                <View style={styles.storyOwnerInfo}>
                  {story.ownerDetails.profilePicture ? (
                    <Image source={{ uri: story.ownerDetails.profilePicture }} style={styles.ownerProfilePicture} />
                  ) : (
                    <View style={styles.ownerProfilePicturePlaceholder} />
                  )}
                  <View style={styles.ownerNameAndTime}>
                    <Text style={styles.storyOwnerName}>{story.ownerDetails.username}</Text>
                    {/* TODO: Implement time ago logic */}
                    {/* Using a placeholder for now */}
                    {story.story_generated_date && <Text style={styles.storyTime}>5 hours ago</Text>}
                  </View>
                  {/* TODO: Replace with actual bookmark icon component */}
                   <TouchableOpacity style={styles.bookmarkIconContainer}>
                       {/* Using a simple character for now */}
                        <Text style={styles.bookmarkIcon}>🔖</Text>
                   </TouchableOpacity>
                </View>
              )}
              {/* Placeholder for Read More or other actions */}
               <TouchableOpacity style={styles.readMorePlaceholder}>
                   <Text style={styles.readMoreText}>Read More</Text>
               </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf0e8', // Light peach background inspired by the image
  },
  bggradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgimage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.9,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 2,
  },
  logoIcon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#fff",
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 20,
  },
  searchText: {
      marginLeft: 6,
      color: "#888",
      fontSize: 14,
  },
  avatar: {
      width: 30,
      height: 30,
      backgroundColor: "#C2644F",
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      marginLeft: 20,
  },
  avatarText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
  },
  friendListContainer: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Lighter border
    zIndex: 2,
    // height: 155,
  },
  friendItem: {
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    paddingHorizontal: 5, // Add slight horizontal padding within each item
  },
  selectedFriendItem: {
    // The image shows a subtle indicator, let's use text color and possibly a slightly larger size or different border
    // For now, just using text color change and bold font.
  },
  profilePicture: {
    width: 85, // Adjusted size
    height: 85,
    borderRadius: 50,
    backgroundColor: '#eee',
    borderWidth: 4, // Add a border
    borderColor: '#00C6EE', // Default transparent border
  },
   profilePicturePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
     borderWidth: 2,
     borderColor: 'transparent',
   },
   selectedProfilePicture: {
     borderColor: '#ff6b6b', // A reddish-orange color similar to the bookmark icon in the image
   },
  friendName: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: '#555', // Default color
  },
   selectedFriendName: {
    fontWeight: 'bold',
    color: '#000', // Darker color for selected name
   },
  addFriendPlaceholder: {
     marginRight: 15,
     alignItems: 'center',
     justifyContent: 'center',
     width: 60, // Match friend item size
     height: 60,
     borderRadius: 30,
     borderWidth: 1,
     borderColor: '#ccc',
     borderStyle: 'dashed',
     backgroundColor: '#f9f9f9', // Slightly different background
     paddingHorizontal: 5, // Add slight horizontal padding
  },
  addFriendPlusText: { // Style for the '+' sign
     fontSize: 24,
     color: '#888',
     lineHeight: 24, // Adjust line height to center the plus sign vertically
  },
   addFriendLabelText: { // Style for 'Add more Friends' label
      fontSize: 8, // Smaller font size
      color: '#888',
      marginTop: 2,
   },
  storiesList: {
    paddingHorizontal: 10,
    paddingTop: 45,
    zIndex: 2,
    height: "95%",
  },
  storyItem: {
    backgroundColor: '#fff', // White background for each story item
    borderRadius: 10,
    marginBottom: 15,
    paddingTop: 18,
    paddingHorizontal: 25,
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 440,
  },
  storyThumbnail: {
    width: '100%',
    height: "58%",
    borderRadius: 8, // Slightly less rounded than the item container
    marginBottom: 15,
  },
  storyContent: {
    paddingHorizontal: 5, // Add some horizontal padding
  },
  storyTitle: {
    fontSize: 20,
    fontFamily: "Inika",
    marginBottom: 5,
    color: '#333', // Darker title color
  },
  storyDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20, // Improve readability
  },
  storyOwnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5, // Add some space below owner info
  },
   ownerProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#eee',
  },
   ownerProfilePicturePlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#eee',
   },
  ownerNameAndTime: {
     flex: 1,
     justifyContent: 'center',
  },
  storyOwnerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  storyTime: {
    fontSize: 10,
    color: '#888',
  },
  bookmarkIconContainer: { // Container for better touch area
    marginLeft: 'auto', // Push to the right
    padding: 5,
  },
   bookmarkIcon: { // Style for the bookmark character
      fontSize: 18,
   },
   readMorePlaceholder: { // Style for Read More placeholder
      marginTop: 5,
      alignSelf: 'flex-start', // Align to the left below description
   },
   readMoreText: { // Style for Read More text
      fontSize: 12,
      color: 'blue', // Or a link color
      fontWeight: 'bold',
   },
}); 