import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 10,
    borderRadius: 8,
    elevation: 2,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  publicationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  asunto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  contenido: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentSection: {
    padding: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  commentFormCard: {
    marginBottom: 15,
    elevation: 2,
  },
  commentForm: {
    flexDirection: 'column',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#690B22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    width: 120,
  },
  commentButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentCard: {
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAuthorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 5,
  },
  replyButtonText: {
    fontSize: 13,
    color: '#690B22',
    marginLeft: 5,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 10,
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingLeft: 15,
  },
  replyItem: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthorImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  replyAuthorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  replyDate: {
    fontSize: 11,
    color: '#888',
  },
  replyContent: {
    fontSize: 14,
    color: '#333',
  },
  replyForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  replyFormContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  replyFormInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  replyFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  replyFormCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  replyFormSend: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#690B22',
  },
  replyFormCancelText: {
    color: '#333',
    fontSize: 14,
  },
  replyFormSendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  backButton: {
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noCommentsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 10,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 10,
  },
  noCommentsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  }
});
