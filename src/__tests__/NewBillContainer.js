/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI";
import NewBill from "../containers/NewBill";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

// use mockStore instead of store
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee and I am on a NewBill page", () => {
  beforeEach(() => {
    // mock local storage and define employee as user
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // initialise root and router
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();

    // mock function modal (create a fake function)
    $.fn.modal = jest.fn();
  });
  describe("When I click on submit", () => {
    test("Then the form is submitted", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI();
      const store = null;
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Get inputs value
      const inputData = {
        type: "Transports",
        name: "Voyage Paris Monaco",
        amount: "200",
        date: "2022-08-22",
        vat: 70,
        pct: 20,
        file: new File(["img"], "image.png", { type: "image/png" }),
        commentary: "dummy test",
        status: "pending",
      };

      // assign value to inputs
      screen.getByTestId("expense-type").value = inputData.type;
      screen.getByTestId("expense-name").value = inputData.name;
      screen.getByTestId("amount").value = inputData.amount;
      screen.getByTestId("datepicker").value = inputData.date;
      screen.getByTestId("vat").value = inputData.vat;
      screen.getByTestId("pct").value = inputData.pct;
      screen.getByTestId("commentary").value = inputData.commentary;

      const inputFile = screen.getByTestId("file");

      // mock handleSubmit function
      const handleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e));

      // get form and listen to submission
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      // upload file
      userEvent.upload(inputFile, inputData.file);

      // submit form
      fireEvent.submit(form);

      // check that function have been called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('WhenI click on button "Choose file"', () => {
    describe("When I choose a good extension (jpeg, jpg, png) file to upload", () => {
      test("Then the file will pass and the name will be found with good extension", () => {
        // initialise page
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // initialise new bill UI
        const html = NewBillUI();
        document.body.innerHTML = html;

        // initialise mock store
        const store = mockStore;

        // initialise new bill handler
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // mock change file function
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        // mock new file
        const file = new File(["image"], "image.jpg", { type: "image/jpeg" });

        // find element in DOM and listen to event
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);

        // mock file upload
        userEvent.upload(inputFile, file);

        // expect function to have been called and file to have been uploaded
        expect(inputFile.files[0].name).toBe("image.jpg");
        expect(handleChangeFile).toBeCalled();
      });
    });

    describe("When I choose a wrong extension file to upload", () => {
      test("Then an error message is displayed", async () => {
        // initialise page
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // initialise new bill UI
        const html = NewBillUI();
        document.body.innerHTML = html;

        // initialise mock store
        const store = mockStore;

        // initialise new bill handler
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        // mock change file function
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        // mock new file with wrong extension
        const file = new File(["test"], "test.gif", { type: "image/gif" });

        // find element in DOM and listen to event
        const inputFile = screen.getByTestId("file");
        inputFile.addEventListener("change", handleChangeFile);

        // mock file upload
        userEvent.upload(inputFile, file);

        // expect file to have been called and error message to have been displayed
        expect(handleChangeFile).toBeCalled();
        expect(screen.getByTestId("error-file-extension")).toBeTruthy();
      });

      test("Then I can choose file but there are an error server 500", async () => {
        jest.spyOn(mockStore, "bills");
        //previent le console.error,
        jest.spyOn(console, "error").mockImplementation(() => {});

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const html = NewBillUI();
        document.body.innerHTML = html;

        //initie le store
        const store = mockStore;

        //Initie newBill
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId("file");

        const img = new File(["img"], "image.png", { type: "image/png" });

        inputFile.addEventListener("change", handleChangeFile);
        await waitFor(() => {
          userEvent.upload(inputFile, img);
        });

        expect(handleChangeFile).toBeCalled();
        expect(inputFile.files[0].name).toBe("image.png");
        await new Promise(process.nextTick);
        expect(console.error).toBeCalled();
      });
    });
  });

  describe("When I submit a new bill", () => {
    test("it POST an new bill to mock API", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      //initie le store
      const store = mockStore;
      // store.update() = jest.fn()

      //Initie newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // watch calls create / update du mock
      const spy = jest.spyOn(mockStore, "bills");

      // Get inputs value
      const inputData = {
        type: "Transports",
        name: "Voyage Paris Monaco",
        amount: "200",
        date: "2022-08-22",
        vat: 70,
        pct: 20,
        file: new File(["img"], "image.png", { type: "image/png" }),
        commentary: "dummy test",
        status: "pending",
      };

      // assign value to inputs
      screen.getByTestId("expense-type").value = inputData.type;
      screen.getByTestId("expense-name").value = inputData.name;
      screen.getByTestId("amount").value = inputData.amount;
      screen.getByTestId("datepicker").value = inputData.date;
      screen.getByTestId("vat").value = inputData.vat;
      screen.getByTestId("pct").value = inputData.pct;
      screen.getByTestId("commentary").value = inputData.commentary;

      const inputFile = screen.getByTestId("file");

      // mock handleSubmit function
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // get form and listen to submission
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      // upload file
      userEvent.upload(inputFile, inputData.file);

      // submit form
      fireEvent.submit(form);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("When an error occurs on API", () => {
    test("Then it should fetches error from an API and fails with 500 error", async () => {
      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error").mockImplementation(() => {});
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      //initie le store
      const store = mockStore;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Submit form
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);

      fireEvent.submit(form);
      // await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
