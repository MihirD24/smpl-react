import { StyleSheet } from "react-native";

export default styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    chatHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 19,
    },
    backButton: {
        marginRight: 10,
    },
    selectedMemberPhoto: {
        height: 35,
        width: 35,
        borderRadius: 50,
        marginRight: 10,
    },
    selectedMemberInfo: {
        width: 120,
    },
    selectedMemberName: { fontWeight: 'bold' },
    selectedMemberLastSeen: {
        color: '#a6a6a6',
    },
    chatWrapper: {
        flex: 1,
        position: 'relative',
    },
    messagesSection: { flex: 1, padding: 16, paddingBottom: 60 },
    singleMessage: {
        maxWidth: '80%',
        marginBottom: 20,
        display: 'flex',
    },
    singleMessageLeft: {
        marginRight: 'auto',
    },
    singleMessageRight: {
        marginLeft: 'auto',
    },
    messagesWithImage: {
        flexDirection: 'row',
    },
    singleMessageText: {
        padding: 10,
        marginBottom: 5,
    },
    singleMessageTextLeft: {
        backgroundColor: '#4099ff1a',
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 22,
        padding: 10,
    },
    singleMessageTextRight: {
        backgroundColor: '#2ed8b61a',
        color: '#fff',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 22,
        padding: 10,
    },
    singleMessageTime: {
        marginBottom: 5,
    },
    singleMessageTimeLeft: {
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        borderBottomLeftRadius: 22,
    },
    singleMessageTimeRight: {
        color: '#000',
        textAlign: 'right'
    },
    singleMessageImage: {
        height: 35,
        maxWidth: 35,
        resizeMode: 'cover',
        borderRadius: 5,
    },
    bottomSection: {
        position: 'absolute',
        bottom: 10,
        left: '5%',
        height: 50,
        width: '90%',
        backgroundColor: '#F1F3F8',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        shadowRadius: 1,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowColor: '#000000',
        elevation: 2,
        marginTop: 1,
    },
    attachmentIconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 35,
        width: 35,
        borderRadius: 50,
        backgroundColor: '#E4E8EC',
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        marginRight: 15,
        fontSize: 15,
    },
    sendIconWrapper: {
        backgroundColor: '#644CBC',
        height: 35,
        width: 35,
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
