import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../../../firebase/config"; // Removed storage import
import { supabase } from "../../../supabase/supabase"; // Added Supabase import
import Card from "../../card/Card";
import Spinner from "../../spinner/Spinner";
import "./AddProduct.scss";
import { selectProducts } from "../../../redux/slice/productSlice";

const categories = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Fashion" },
  { id: 4, name: "Phone" },
  { id: 5, name: "Furniture" },
];

const initialState = {
  name: "",
  imageURL: "",
  price: 0,
  category: "",
  brand: "",
  model: "",
  releaseDate: "",
  modelNumber: "",
  weight: 0,
  desc: "",
};

const AddProduct = () => {
  const { id } = useParams();
  const products = useSelector(selectProducts);
  const productEdit = products.find((item) => item.id === id);

  const [product, setProduct] = useState(() => {
    const newState = detectForm(id, { ...initialState }, productEdit);
    return newState;
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function detectForm(id, f1, f2) {
    if (id === "ADD") {
      return f1;
    }
    return f2;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const uniqueFileName = `${uuidv4()}${file.name}`;
      const { data, error } = await supabase.storage
        .from('product-images') // Your Supabase bucket name
        .upload(`images/${uniqueFileName}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        toast.error(`Upload error: ${error.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(`images/${uniqueFileName}`);

      setProduct({ ...product, imageURL: urlData.publicUrl });
      setUploadProgress(100); // Simulating completion since Supabase doesn't provide progress natively
      toast.success("Image uploaded successfully.");
    }
  };

// const handleImageChange = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   setUploadProgress(0); // Reset progress
//   const uniqueFileName = `${uuidv4()}${file.name}`;
//   const fullPath = `images/${uniqueFileName}`; // Explicitly define the path
//   console.log("Attempting upload to path:", fullPath);
//   try {
//     const { data, error } = await supabase.storage
//       .from('product-images') // Your Supabase bucket name
//       .upload(fullPath, file, {
//         cacheControl: '3600',
//         upsert: false,
//       });

//     if (error) {
//       console.error("Upload error:", error);
//       toast.error(`Upload failed: ${error.message}`);
//       setUploadProgress(0);
//       return;
//     }

//     console.log("Upload successful, data:", data);
//     const { data: urlData, error: urlError } = await supabase.storage
//       .from('product-images')
//       .getPublicUrl(fullPath);

//     if (urlError || !urlData) {
//       console.error("URL retrieval error or null data:", urlError || "No URL data");
//       toast.error("Failed to retrieve image URL");
//       setUploadProgress(0);
//       return;
//     }

//     console.log("Public URL:", urlData.publicUrl);
//     setProduct({ ...product, imageURL: urlData.publicUrl });
//     setUploadProgress(100); // Set to 100% on success
//     toast.success("Image uploaded successfully.");
//   } catch (error) {
//     console.error("Unexpected error during upload:", error);
//     toast.error(`Error uploading image: ${error.message}`);
//     setUploadProgress(0);
//   }
// };


  const addProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const docRef = await addDoc(collection(db, "products"), {
        name: product.name,
        imageURL: product.imageURL,
        price: Number(product.price),
        category: product.category,
        brand: product.brand,
        model: product.model,
        releaseDate: product.releaseDate,
        modelNumber: product.modelNumber,
        weight: Number(product.weight),
        desc: product.desc,
        createdAt: Timestamp.now().toDate(),
      });
      setIsLoading(false);
      setUploadProgress(0);
      setProduct({ ...initialState });

      toast.success("Product uploaded successfully.");
      navigate("/admin/all-products");
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  const editProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (product.imageURL && product.imageURL !== productEdit.imageURL) {
      // Delete old image from Supabase if it exists and is different
      if (productEdit.imageURL) {
        const oldFilePath = productEdit.imageURL.split('/public/').pop(); // Extract path from URL
        const { error } = await supabase.storage
          .from('product-images')
          .remove([`images/${oldFilePath}`]);
        if (error) {
          console.error('Error deleting old image:', error.message);
        }
      }
    }

    try {
      await setDoc(doc(db, "products", id), {
        name: product.name,
        imageURL: product.imageURL,
        price: Number(product.price),
        category: product.category,
        brand: product.brand,
        model: product.model,
        releaseDate: product.releaseDate,
        modelNumber: product.modelNumber,
        weight: Number(product.weight),
        desc: product.desc,
        createdAt: productEdit.createdAt,
        editedAt: Timestamp.now().toDate(),
      });
      setIsLoading(false);
      toast.success("Product Edited Successfully");
      navigate("/admin/all-products");
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="add-product-wrap">
      {isLoading && <Spinner />}
      <div className="add-product">
        <h3>{detectForm(id, "Add New Product", "Edit Product")}</h3>
        <Card>
          <form onSubmit={detectForm(id, addProduct, editProduct)}>
            <div className="--form-control">
              <label>Product name:</label>
              <input
                type="text"
                placeholder="Product name"
                required
                name="name"
                value={product.name}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="--form-control">
              <label>
                Product image:{" "}
                <p className="--small-para">
                  (Select maximum 1 image and image size should be less than
                  2mb)
                </p>
              </label>

              <Card>
                {uploadProgress === 0 ? null : (
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress < 100
                        ? `Uploading ${uploadProgress}`
                        : `Upload Complete ${uploadProgress}%`}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  placeholder="Product Image"
                  name="image"
                  multiple={false}
                  onChange={(e) => handleImageChange(e)}
                  required
                />

                {product.imageURL === "" ? null : (
                  <input
                    type="text"
                    required
                    placeholder="Image URL"
                    name="imageURL"
                    value={product.imageURL}
                    disabled
                  />
                )}
              </Card>
            </div>
            <div className="--form-control">
              <label>Product price:</label>
              <input
                type="number"
                placeholder="Product price"
                required
                name="price"
                value={product.price}
                onChange={(e) => handleInputChange(e)}
              />
            </div>

            <div className="--form-control">
              <label>Product Category:</label>
              <select
                required
                name="category"
                value={product.category}
                onChange={(e) => handleInputChange(e)}
              >
                <option value="" disabled>
                  -- choose product category --
                </option>
                {categories.map((cat) => {
                  return (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="--form-control">
              <label>Product Company/Brand:</label>
              <input
                type="text"
                placeholder="Product brand"
                required
                name="brand"
                value={product.brand}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="--form-control">
              <label>Product Model:</label>
              <input
                type="text"
                placeholder="Product model"
                required
                name="model"
                value={product.model}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="--form-control">
              <label>Product Release Date:</label>
              <input
                type="date"
                placeholder="Product release date"
                required
                name="releaseDate"
                value={product.releaseDate}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="--form-control">
              <label>Product Model Number:</label>
              <input
                type="text"
                placeholder="Product model number"
                required
                name="modelNumber"
                value={product.modelNumber}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="--form-control">
              <label>
                Product Weight:{" "}
                <p className="--small-para">(mention in grams)</p>
              </label>
              <input
                type="text"
                placeholder="Product weight"
                required
                name="weight"
                value={product.weight}
                onChange={(e) => handleInputChange(e)}
              />
            </div>
            <div className="--form-control">
              <label>Product Description:</label>
              <textarea
                name="desc"
                required
                value={product.desc}
                onChange={(e) => handleInputChange(e)}
                rows="5"
                cols="30"
              ></textarea>
            </div>
            <button className="button --btn --bg-green">
              {detectForm(id, "Save Product", "Edit Product")}
            </button>
            {/* <button
  className="button --btn --bg-green"
  disabled={isLoading || (product.imageURL === "" && detectForm(id, true, false))}
> 
  {detectForm(id, "Save Product", "Edit Product")}
</button>*/}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;