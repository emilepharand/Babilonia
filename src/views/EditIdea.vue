<template>
  <div class="view">
    <h1>Edit Idea</h1>
    <div v-if="ideaNotFound">
      <p>Idea was not found.</p>
    </div>
    <div v-else-if="loaded">
      <IdeaForm
        :idea="idea"
        title="Edit Idea"
      />
      <button
        id="add-rows"
        class="btn btn-outline-secondary w-100 mt-2 mb-2"
        @click="addRows()"
      >
        More Rows
      </button>
      <div class="d-flex btn-group">
        <button
          id="edit-button"
          class="btn btn-outline-primary flex-grow-1"
          @click="edit()"
        >
          Edit
        </button>
        <button
          id="delete-button"
          class="btn btn-outline-danger flex-grow-1"
          data-bs-toggle="modal"
          data-bs-target="#confirm-delete-modal"
        >
          Delete
        </button>
      </div>
    </div>
    <div
      id="confirm-delete-modal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              id="exampleModalLabel"
              class="modal-title"
            >
              Confirm
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div class="modal-body">
            Do you really want to delete this idea?
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              id="modal-delete-button"
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              @click="deleteIdea()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// In a separate file because of #66
import IdeaForm from '@/components/IdeaForm.vue';
import {addRows, deleteIdea, edit, idea, ideaNotFound, loaded} from '@/views/EditIdea'; </script>
