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
        @move-focus-down="moveFocusDown"
        @move-focus-up="moveFocusUp"
        @set-last-text-input="setLastTextInput"
        @set-first-text-input="setFirstTextInput"
        @init-elements="setInitElements"
      />
      <button
        id="add-rows"
        ref="addRowsButton"
        class="btn btn-outline-secondary w-100 mt-2 mb-2"
        @click="addRows()"
        @keydown.up="focusLastTextInput"
        @keydown.down="focusBelowAddRows"
      >
        More Rows
      </button>
      <div class="d-flex btn-group">
        <button
          id="edit-button"
          ref="editButton"
          class="btn btn-outline-primary flex-grow-1"
          @keydown.up="addRowsButton.focus()"
          @keydown.down="focusFirstTextInput"
          @keydown.right="deleteButton.focus()"
          @click="edit()"
        >
          Edit
        </button>
        <button
          id="delete-button"
          ref="deleteButton"
          class="btn btn-outline-danger flex-grow-1"
          data-bs-toggle="modal"
          data-bs-target="#confirm-delete-modal"
          @keydown.up="addRowsButton.focus()"
          @keydown.down="focusFirstTextInput"
          @keydown.left="editButton.focus()"
        >
          Delete
        </button>
      </div>
      <div>
        <span
          v-if="isShowError"
          id="error-text"
          class="pl-2 text-danger"
        >{{ errorText }}</span>
        <span
          v-else-if="isShowSuccess"
          id="success-text"
          class="pl-2 text-success"
        >Idea was edited.</span>
      </div>
    </div>
    <div
      id="confirm-delete-modal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="confirm-delete-modal-label"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5
              id="confirm-delete-modal-label"
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
              id="modal-cancel-button"
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
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getEmptyIdeaNoAsync} from '../../server/model/ideas/idea';
import IdeaForm from '../components/IdeaForm.vue';
import * as Utils from '../ts/utils';
import {validateIdeaForm} from '../ts/utils';
import * as Api from '../ts/api';

const idea = ref(getEmptyIdeaNoAsync());
const loaded = ref(false);
const ideaNotFound = ref(false);
const errorText = ref('');
const isShowError = ref(false);
const isShowSuccess = ref(false);
const editButton = ref(document.createElement('button'));
const deleteButton = ref(document.createElement('button'));
const addRowsButton = ref(document.createElement('button'));

const route = useRoute();
const ideaId = Number.parseInt(Array.from(route.params.id).join(''), 10);
let lastTextInput = document.createElement('input');
let firstTextInput = document.createElement('input');
let initElements: () => void;

// Initialize idea
(async () => {
	try {
		idea.value = await Api.getIdea(ideaId);
		loaded.value = true;
	} catch {
		ideaNotFound.value = true;
	}
}
)();

async function addRows() {
	idea.value = await Utils.addEmptyExpressions(idea.value);
	initElements();
}

async function edit() {
	const ideaForAdding = validateIdeaForm(idea, errorText);
	if (errorText.value !== '') {
		isShowError.value = true;
	}
	if (ideaForAdding) {
		await Api.editIdea(ideaForAdding, idea.value.id);
		// Reorder expressions
		idea.value = await Api.getIdea(idea.value.id);
		isShowSuccess.value = true;
	}
}

function moveFocusUp() {
	editButton.value.focus();
}

function moveFocusDown() {
	addRowsButton.value.focus();
}

function setLastTextInput(element: HTMLInputElement) {
	lastTextInput = element;
}

function setFirstTextInput(element: HTMLInputElement) {
	firstTextInput = element;
}

function focusFirstTextInput() {
	firstTextInput.focus();
}

function focusLastTextInput() {
	lastTextInput.focus();
}

function focusBelowAddRows() {
	editButton.value.focus();
}

function setInitElements(fn: () => void) {
	initElements = fn;
}

// Router needs to be declared outside function
const router = useRouter();
async function deleteIdea() {
	await Api.deleteIdea(ideaId);
	await router.push('/');
}
</script>
